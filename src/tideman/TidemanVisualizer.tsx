import React, { useMemo, useState, useEffect } from 'react'

export default function TidemanVisualizer(): JSX.Element {
  const [candidateText, setCandidateText] = useState<string>('Alice, Bob, Charlie')
  const candidates = useMemo<string[]>(
    () => candidateText.split(',').map(s => s.trim()).filter(Boolean),
    [candidateText]
  )

  const [ballotsText, setBallotsText] = useState<string>([
    'Alice>Bob>Charlie',
    'Bob>Alice>Charlie',
    'Bob>Charlie>Alice',
    'Charlie>Alice>Bob',
    'Alice>Charlie>Bob',
  ].join('\n'))

  const [autoRun, setAutoRun] = useState<boolean>(false)
  const [stepIndex, setStepIndex] = useState<number>(0)

  type Ballot = number[]
  const eq = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase()
  const candidateIndex = (name: string) => candidates.findIndex(c => eq(c, name))

  const parseBallotLine = (line: string): Ballot | null => {
    const parts = line.split(/>|,/g).map(s => s.trim()).filter(Boolean)
    if (parts.length !== candidates.length) return null
    const idxs = parts.map(candidateIndex)
    if (idxs.some(i => i < 0)) return null
    if (new Set(idxs).size !== idxs.length) return null
    return idxs
  }

  const ballots: Ballot[] = useMemo(() => {
    const lines = ballotsText.split(/\n|;+/g).map(s => s.trim()).filter(Boolean)
    const parsed: Ballot[] = []
    for (const line of lines) {
      const b = parseBallotLine(line)
      if (b) parsed.push(b)
    }
    return parsed
  }, [ballotsText, candidates])

  const preferences = useMemo<number[][]>(() => {
    const n = candidates.length
    const pref = Array.from({ length: n }, () => Array(n).fill(0))
    for (const ballot of ballots) {
      for (let r = 0; r < ballot.length; r++) {
        const higher = ballot[r]
        for (let s = r + 1; s < ballot.length; s++) {
          const lower = ballot[s]
          pref[higher][lower] += 1
        }
      }
    }
    return pref
  }, [ballots, candidates.length])

  type Pair = { winner: number; loser: number; margin: number; wv: number; lv: number }
  const pairs = useMemo<Pair[]>(() => {
    const n = candidates.length
    const list: Pair[] = []
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) continue
        const a = preferences[i][j]
        const b = preferences[j][i]
        if (a > b) list.push({ winner: i, loser: j, margin: a - b, wv: a, lv: b })
      }
    }
    list.sort((p, q) => (q.margin - p.margin) || (q.wv - p.wv) || (p.lv - q.lv))
    return list
  }, [preferences, candidates.length])

  const lockUpTo = (k: number): boolean[][] => {
    const n = candidates.length
    const locked: boolean[][] = Array.from({ length: n }, () => Array(n).fill(false))

    const createsCycle = (from: number, to: number): boolean => {
      const seen = new Set<number>()
      const stack: number[] = [to]
      while (stack.length) {
        const cur = stack.pop() as number
        if (cur === from) return true
        if (seen.has(cur)) continue
        seen.add(cur)
        for (let nxt = 0; nxt < n; nxt++) {
          if (locked[cur][nxt]) stack.push(nxt)
        }
      }
      return false
    }

    for (let i = 0; i < Math.min(k, pairs.length); i++) {
      const { winner, loser } = pairs[i]
      if (!createsCycle(winner, loser)) locked[winner][loser] = true
    }
    return locked
  }

  const locked = useMemo<boolean[][]>(() => lockUpTo(stepIndex), [stepIndex, candidates.length, pairs])

  const winnerIndex = useMemo<number>(() => {
    const n = candidates.length
    for (let i = 0; i < n; i++) {
      let incoming = 0
      for (let j = 0; j < n; j++) {
        if (locked[j][i]) incoming++
      }
      if (incoming === 0) return i
    }
    return -1
  }, [locked, candidates.length])

  useEffect(() => {
    if (!autoRun) return
    if (stepIndex < pairs.length) {
      const t = setTimeout(() => setStepIndex(s => s + 1), 600)
      return () => clearTimeout(t)
    } else {
      setAutoRun(false)
    }
  }, [autoRun, stepIndex, pairs.length])

  const resetSteps = () => {
    setAutoRun(false)
    setStepIndex(0)
  }

  const graphSize = 300
  const radius = 110
  const center = { x: graphSize / 2, y: graphSize / 2 }
  const nodePos = candidates.map((_, i) => {
    const angle = (2 * Math.PI * i) / Math.max(1, candidates.length)
    return {
      x: center.x + radius * Math.cos(angle - Math.PI / 2),
      y: center.y + radius * Math.sin(angle - Math.PI / 2),
    }
  })

  const edges = useMemo(() => {
    const list: { from: number; to: number }[] = []
    for (let i = 0; i < locked.length; i++) {
      for (let j = 0; j < locked.length; j++) {
        if (locked[i][j]) list.push({ from: i, to: j })
      }
    }
    return list
  }, [locked])

  const smallPreset = () => {
    setCandidateText('Alice, Bob, Charlie')
    setBallotsText(['Alice>Bob>Charlie', 'Bob>Charlie>Alice', 'Bob>Alice>Charlie', 'Charlie>Alice>Bob', 'Alice>Charlie>Bob'].join('\n'))
    resetSteps()
  }

  const rockPaperScissorsPreset = () => {
    setCandidateText('Rock, Paper, Scissors')
    setBallotsText(['Rock>Scissors>Paper', 'Paper>Rock>Scissors', 'Scissors>Paper>Rock', 'Rock>Paper>Scissors', 'Scissors>Rock>Paper'].join('\n'))
    resetSteps()
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 text-gray-900 p-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold">Tideman (Ranked Pairs) Visualizer</h1>
          <div className="flex gap-2">
            <button onClick={smallPreset} className="px-3 py-1.5 rounded-xl bg-white border shadow-sm hover:bg-gray-100 text-sm">Preset: Alice/Bob/Charlie</button>
            <button onClick={rockPaperScissorsPreset} className="px-3 py-1.5 rounded-xl bg-white border shadow-sm hover:bg-gray-100 text-sm">Preset: R/P/S</button>
          </div>
        </header>

        <section className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-sm border p-4">
            <h2 className="font-semibold mb-2">1) Candidates</h2>
            <p className="text-sm text-gray-600 mb-3">
              <span className="font-medium">Overview:</span> Define all candidates participating in the election. 
              These are the options voters will rank in their ballots.
            </p>
            <p className="text-sm text-gray-600 mb-2">Comma-separated list. Case-insensitive; names must be unique.</p>
            <input
              value={candidateText}
              onChange={(e) => { setCandidateText(e.target.value); resetSteps(); }}
              className="w-full rounded-xl border px-3 py-2"
            />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border p-4">
            <h2 className="font-semibold mb-2">2) Ballots</h2>
            <p className="text-sm text-gray-600 mb-3">
              <span className="font-medium">Overview:</span> Collect ranked-choice ballots from voters. 
              Each ballot represents one voter's preference ordering from most to least preferred.
            </p>
            <p className="text-sm text-gray-600 mb-2">
              One ballot per line. Use <code className="bg-gray-100 px-1 rounded">&gt;</code> or commas:
              <span className="font-mono"> Alice&gt;Bob&gt;Charlie</span>
            </p>
            <textarea
              value={ballotsText}
              onChange={(e) => { setBallotsText(e.target.value); resetSteps(); }}
              rows={8}
              className="w-full rounded-xl border px-3 py-2 font-mono text-sm"
            />
            <div className="mt-2 text-xs text-gray-500">Invalid lines are ignored. Complete strict rankings only (no ties).</div>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-sm border p-4 mb-6">
          <h2 className="font-semibold mb-3">3) Pairwise Preferences</h2>
          <p className="text-sm text-gray-600 mb-3">
            <span className="font-medium">Overview:</span> Count head-to-head matchups between all pairs of candidates. 
            Each cell [i][j] shows how many voters prefer candidate i over candidate j across all ballots.
          </p>
          <p className="text-xs text-blue-700 bg-blue-50 px-3 py-2 rounded-lg mb-3">
            <span className="font-medium">💡 Tip:</span> Read the table as <b>row beats column</b>. 
            For example, the value in Alice's row and Bob's column shows how many voters prefer Alice over Bob.
            When solving LeetCode problems with graphs and DFS, thinking in terms of rows and columns often helps clarify the logic.
          </p>
          <div className="overflow-auto">
            <table className="min-w-full border-separate border-spacing-0 text-sm">
              <thead>
                <tr>
                  <th className="sticky left-0 bg-white z-10 border-b p-2 text-left">\</th>
                  {candidates.map((c, j) => (
                    <th key={j} className="border-b p-2 text-left">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {candidates.map((row, i) => (
                  <tr key={i}>
                    <th className="sticky left-0 bg-white z-10 border-b p-2 text-left">{row}</th>
                    {candidates.map((_, j) => (
                      <td key={j} className={`border-b p-2 text-center ${i===j ? 'bg-gray-50 text-gray-400' : ''}`}>
                        {i === j ? '—' : preferences[i][j]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-sm border p-4">
            <h2 className="font-semibold mb-2">4) Sorted Pairs (winner → loser)</h2>
            <p className="text-sm text-gray-600 mb-3">
              <span className="font-medium">Overview:</span> Create and sort all winning pairs by victory margin. 
              Then lock pairs one-by-one, skipping any that would create a cycle in the graph. 
              This ensures the final result is a directed acyclic graph (DAG).
            </p>
            <div className="flex items-center justify-between mb-2">
              <div></div>
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1.5 rounded-xl bg-gray-900 text-white text-sm disabled:opacity-40"
                  onClick={() => setStepIndex(s => Math.max(0, s - 1))}
                  disabled={stepIndex === 0}
                >Step –</button>
                <button
                  className="px-3 py-1.5 rounded-xl bg-gray-900 text-white text-sm disabled:opacity-40"
                  onClick={() => setStepIndex(s => Math.min(pairs.length, s + 1))}
                  disabled={stepIndex >= pairs.length}
                >Step +</button>
                <button
                  className="px-3 py-1.5 rounded-xl bg-white border shadow-sm text-sm"
                  onClick={() => setAutoRun(v => !v)}
                  disabled={stepIndex >= pairs.length}
                >{autoRun ? 'Pause' : 'Auto-run'}</button>
                <button
                  className="px-3 py-1.5 rounded-xl bg-white border shadow-sm text-sm"
                  onClick={resetSteps}
                >Reset</button>
              </div>
            </div>
            <ol className="space-y-1 text-sm">
              {pairs.map((p, i) => {
                const lockedNow = i < stepIndex && locked[p.winner][p.loser]
                return (
                  <li key={i} className={`flex items-center justify-between rounded-lg border p-2 ${i === stepIndex - 1 ? 'ring-2 ring-blue-400' : ''}`}>
                    <div>
                      <span className="font-medium">{candidates[p.winner]} → {candidates[p.loser]}</span>
                      <span className="ml-2 text-gray-500">(margin {p.margin}, {p.wv}-{p.lv})</span>
                    </div>
                    <div>
                      {i >= stepIndex ? (
                        <span className="text-gray-400">pending</span>
                      ) : lockedNow ? (
                        <span className="px-2 py-0.5 text-xs rounded bg-green-100 text-green-800">locked</span>
                      ) : (
                        <span className="px-2 py-0.5 text-xs rounded bg-amber-100 text-amber-800">skipped (cycle)</span>
                      )}
                    </div>
                  </li>
                )
              })}
            </ol>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border p-4">
            <h2 className="font-semibold mb-2">5) Graph of Locked Pairs</h2>
            <p className="text-sm text-gray-600 mb-3">
              <span className="font-medium">Overview:</span> Visualize the locked edges as a directed graph. 
              The winner is the "source" node with no incoming edges—the candidate who beats others but isn't beaten by anyone in the final graph.
            </p>
            <svg viewBox={`0 0 ${graphSize} ${graphSize}`} className="w-full h-[320px]">
              {edges.map((e, idx) => {
                const a = nodePos[e.from]
                const b = nodePos[e.to]
                const path = arrowPath(a, b, 18)
                return (
                  <g key={idx} className="opacity-90">
                    <path d={path} fill="currentColor" className="text-gray-400" />
                  </g>
                )
              })}
              {nodePos.map((p, i) => (
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r={18} className={`${i===winnerIndex ? 'fill-emerald-200' : 'fill-gray-100'} stroke-gray-400`} />
                  <text x={p.x} y={p.y + 4} textAnchor="middle" className="text-xs fill-gray-800">
                    {labelFor(candidates[i])}
                  </text>
                </g>
              ))}
            </svg>
            <div className="text-sm text-gray-600">Winner (source): {winnerIndex>=0 ? <b>{candidates[winnerIndex]}</b> : '—'}</div>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-sm border p-4">
          <h2 className="font-semibold mb-2">How this matches CS50 Tideman</h2>
          <ul className="list-disc pl-5 text-sm space-y-1 text-gray-700">
            <li><b>preferences[i][j]</b> counts voters who rank candidate <i>i</i> over <i>j</i>.</li>
            <li><b>pairs</b> collects all (winner, loser) where preferences[winner][loser] &gt; preferences[loser][winner], sorted by margin descending.</li>
            <li><b>lock</b> iterates sorted pairs; it locks an edge unless doing so would create a cycle (DFS cycle check).</li>
            <li><b>Winner</b> has no incoming edges (source of the DAG).</li>
          </ul>
        </section>

        <footer className="text-xs text-gray-500 mt-6">
          Tip: paste your class test cases, then click <b>Auto-run</b> or step through to watch cycle prevention in action.
        </footer>
      </div>
    </div>
  )
}

function labelFor(name: string): string {
  const t = name.trim()
  if (t.length <= 3) return t
  const parts = t.split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return t.slice(0, 3)
}

function arrowPath(a: { x: number; y: number }, b: { x: number; y: number }, r: number): string {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const L = Math.hypot(dx, dy) || 1
  const ux = dx / L
  const uy = dy / L
  const startX = a.x + ux * r
  const startY = a.y + uy * r
  const endX = b.x - ux * r
  const endY = b.y - uy * r
  const mx = (startX + endX) / 2
  const my = (startY + endY) / 2
  const perp = { x: -uy, y: ux }
  const bend = 16
  const cx = mx + perp.x * bend
  const cy = my + perp.y * bend
  const ah = 8
  const left = rotate(endX - ux * ah, endY - uy * ah, endX, endY, Math.PI / 6)
  const right = rotate(endX - ux * ah, endY - uy * ah, endX, endY, -Math.PI / 6)
  return `M ${startX} ${startY} Q ${cx} ${cy} ${endX} ${endY} L ${left.x} ${left.y} M ${endX} ${endY} L ${right.x} ${right.y}`
}

function rotate(x: number, y: number, cx: number, cy: number, ang: number) {
  const s = Math.sin(ang)
  const c = Math.cos(ang)
  const dx = x - cx
  const dy = y - cy
  return { x: cx + dx * c - dy * s, y: cy + dx * s + dy * c }
}
