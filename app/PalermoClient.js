'use client'

import { useEffect, useRef, useState } from 'react'

const DEFAULT_ROLES = [
  { id: 'killer', label: 'Killer', emoji: '🔪', count: 2, min: 1 },
  { id: 'detective', label: 'Detective', emoji: '🕵️', count: 1, min: 0 },
  { id: 'doctor', label: 'Doctor', emoji: '🩺', count: 1, min: 0 },
  { id: 'lover', label: 'Lover', emoji: '❤️', count: 1, min: 0 },
  { id: 'kamikaze', label: 'Kamikaze', emoji: '💣', count: 1, min: 0 },
  { id: 'madness', label: 'Madness', emoji: '🌀', count: 1, min: 0 },
]

const citizen = { id: 'citizen', label: 'Citizen', emoji: '👤' }

function randomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

function shuffle(items) {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export default function PalermoClient() {
  const [screen, setScreen] = useState('home')
  const [name, setName] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [joinMode, setJoinMode] = useState('player')
  const [isHost, setIsHost] = useState(false)
  const [players, setPlayers] = useState([])
  const [spectators, setSpectators] = useState([])
  const [maxPlayers, setMaxPlayers] = useState(10)
  const [maxSpectators, setMaxSpectators] = useState(4)
  const [roles, setRoles] = useState(DEFAULT_ROLES)
  const [ready, setReady] = useState(false)
  const [connectionState, setConnectionState] = useState('idle')
  const [connectionError, setConnectionError] = useState('')
  const [countdown, setCountdown] = useState(null)
  const [myRole, setMyRole] = useState(null)
  const [phase, setPhase] = useState('night')
  const [round, setRound] = useState(1)
  const [discussion, setDiscussion] = useState(180)
  const [vote, setVote] = useState('')
  const [micState, setMicState] = useState('idle')
  const [micError, setMicError] = useState('')
  const [muted, setMuted] = useState(false)

  const peerRef = useRef(null)
  const hostConnRef = useRef(null)
  const guestConnsRef = useRef(new Map())
  const streamRef = useRef(null)

  useEffect(() => {
    const existing = document.querySelector('script[data-peerjs]')
    if (existing) return
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/peerjs@1.5.5/dist/peerjs.min.js'
    script.async = true
    script.dataset.peerjs = 'true'
    document.head.appendChild(script)
  }, [])

  useEffect(() => {
    if (discussion <= 0 || phase !== 'day') return
    const t = setInterval(() => setDiscussion(v => Math.max(0, v - 1)), 1000)
    return () => clearInterval(t)
  }, [phase, discussion])

  useEffect(() => {
    return () => {
      peerRef.current?.destroy?.()
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    }
  }, [])

  function getPeer() {
    return window.Peer
  }

  function roomPeerId(code) {
    return 'palermo-room-' + code.toLowerCase()
  }

  function broadcast(payload) {
    guestConnsRef.current.forEach(conn => {
      if (conn?.open) conn.send(payload)
    })
  }

  function broadcastState(nextPlayers = players, nextSpectators = spectators, extra = {}) {
    broadcast({
      type: 'room-state',
      players: nextPlayers,
      spectators: nextSpectators,
      maxPlayers,
      maxSpectators,
      roles,
      ...extra,
    })
  }

  function setupHostConnection(conn) {
    guestConnsRef.current.set(conn.peer, conn)

    conn.on('data', data => {
      if (!data || typeof data !== 'object') return

      if (data.type === 'join') {
        const entry = {
          id: conn.peer,
          name: String(data.name || 'Player').slice(0, 18),
          ready: false,
          isHost: false,
        }

        if (data.mode === 'spectator') {
          setSpectators(current => {
            if (current.length >= maxSpectators) {
              conn.send({ type: 'join-error', message: 'Spectator slots are full.' })
              return current
            }
            const next = [...current.filter(p => p.id !== conn.peer), entry]
            setTimeout(() => broadcastState(players, next), 0)
            return next
          })
        } else {
          setPlayers(current => {
            if (current.length >= maxPlayers) {
              conn.send({ type: 'join-error', message: 'Player slots are full.' })
              return current
            }
            const next = [...current.filter(p => p.id !== conn.peer), entry]
            setTimeout(() => broadcastState(next, spectators), 0)
            return next
          })
        }
      }

      if (data.type === 'ready') {
        setPlayers(current => {
          const next = current.map(p => p.id === conn.peer ? { ...p, ready: !!data.ready } : p)
          setTimeout(() => broadcastState(next, spectators), 0)
          return next
        })
      }
    })

    conn.on('close', () => {
      guestConnsRef.current.delete(conn.peer)
      setPlayers(current => {
        const next = current.filter(p => p.id !== conn.peer)
        setTimeout(() => broadcastState(next, spectators), 0)
        return next
      })
      setSpectators(current => {
        const next = current.filter(p => p.id !== conn.peer)
        setTimeout(() => broadcastState(players, next), 0)
        return next
      })
    })
  }

  function createRoom() {
    if (!name.trim()) return
    const Peer = getPeer()
    if (!Peer) {
      setConnectionError('Multiplayer is still loading. Try again in a second.')
      return
    }

    const code = randomCode()
    setRoomCode(code)
    setIsHost(true)
    setConnectionState('connecting')
    setConnectionError('')

    const peer = new Peer(roomPeerId(code))
    peerRef.current = peer

    peer.on('open', id => {
      const hostPlayer = { id, name: name.trim().slice(0,18), ready: false, isHost: true }
      setPlayers([hostPlayer])
      setSpectators([])
      setConnectionState('connected')
      setScreen('lobby')
    })

    peer.on('connection', setupHostConnection)
    peer.on('error', err => {
      setConnectionState('error')
      setConnectionError(err?.type === 'unavailable-id' ? 'Room code collision. Please create a new room.' : 'Could not open the room.')
    })
  }

  function joinRoom() {
    if (!name.trim() || !joinCode.trim()) return
    const Peer = getPeer()
    if (!Peer) {
      setConnectionError('Multiplayer is still loading. Try again in a second.')
      return
    }

    const code = joinCode.trim().toUpperCase()
    setRoomCode(code)
    setIsHost(false)
    setConnectionState('connecting')
    setConnectionError('')

    const peer = new Peer()
    peerRef.current = peer

    peer.on('open', () => {
      const conn = peer.connect(roomPeerId(code), { reliable: true })
      hostConnRef.current = conn

      conn.on('open', () => {
        conn.send({ type: 'join', name: name.trim(), mode: joinMode })
        setConnectionState('connected')
        setScreen('lobby')
      })

      conn.on('data', data => {
        if (!data || typeof data !== 'object') return
        if (data.type === 'room-state') {
          setPlayers(data.players || [])
          setSpectators(data.spectators || [])
          setMaxPlayers(data.maxPlayers ?? 10)
          setMaxSpectators(data.maxSpectators ?? 4)
          setRoles(data.roles || DEFAULT_ROLES)
        }
        if (data.type === 'join-error') {
          setConnectionError(data.message || 'Could not join room.')
          setConnectionState('error')
        }
        if (data.type === 'countdown') setCountdown(data.value)
        if (data.type === 'game-start') {
          setMyRole(data.role)
          setCountdown(null)
          setScreen('role')
        }
      })

      conn.on('close', () => {
        setConnectionState('error')
        setConnectionError('Connection to host was lost.')
      })

      conn.on('error', () => {
        setConnectionState('error')
        setConnectionError('Could not connect to that room code.')
      })
    })
  }

  function toggleReady() {
    const nextReady = !ready
    setReady(nextReady)

    if (isHost) {
      setPlayers(current => {
        const next = current.map(p => p.isHost ? { ...p, ready: nextReady } : p)
        setTimeout(() => broadcastState(next, spectators), 0)
        return next
      })
    } else {
      hostConnRef.current?.send({ type: 'ready', ready: nextReady })
    }
  }

  function changeRole(id, delta) {
    if (!isHost) return
    setRoles(current => {
      const next = current.map(role => role.id === id
        ? { ...role, count: Math.max(role.min, Math.min(4, role.count + delta)) }
        : role
      )
      setTimeout(() => broadcast({ type:'room-state', players, spectators, maxPlayers, maxSpectators, roles: next }), 0)
      return next
    })
  }

  function changeMaxPlayers(value) {
    const next = Number(value)
    setMaxPlayers(next)
    setTimeout(() => broadcast({ type:'room-state', players, spectators, maxPlayers: next, maxSpectators, roles }), 0)
  }

  function changeMaxSpectators(value) {
    const next = Number(value)
    setMaxSpectators(next)
    setTimeout(() => broadcast({ type:'room-state', players, spectators, maxPlayers, maxSpectators: next, roles }), 0)
  }

  function startGame() {
    if (!isHost || players.length < 2 || !players.every(p => p.ready)) return

    let value = 5
    setCountdown(value)
    broadcast({ type: 'countdown', value })

    const timer = setInterval(() => {
      value -= 1
      setCountdown(value)
      broadcast({ type: 'countdown', value })

      if (value <= 0) {
        clearInterval(timer)

        let pool = roles.flatMap(role => Array(role.count).fill(role))
        while (pool.length < players.length) pool.push(citizen)
        pool = shuffle(pool).slice(0, players.length)

        players.forEach((player, index) => {
          const role = pool[index] || citizen
          if (player.isHost) {
            setMyRole(role)
          } else {
            guestConnsRef.current.get(player.id)?.send({ type: 'game-start', role })
          }
        })

        setCountdown(null)
        setScreen('role')
      }
    }, 1000)
  }

  async function requestMic() {
    setMicError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      streamRef.current = stream
      setMicState('granted')
      setMuted(false)
    } catch {
      setMicState('denied')
      setMicError('Microphone permission was denied or unavailable.')
    }
  }

  function toggleMute() {
    const stream = streamRef.current
    if (!stream) return
    const next = !muted
    stream.getAudioTracks().forEach(track => { track.enabled = !next })
    setMuted(next)
  }

  function nextPhase() {
    if (phase === 'night') {
      setPhase('day')
      setDiscussion(180)
    } else setPhase('vote')
  }

  function finishVote() {
    setPhase('night')
    setRound(r => r + 1)
    setVote('')
  }

  const timerText = `${String(Math.floor(discussion / 60)).padStart(2, '0')}:${String(discussion % 60).padStart(2, '0')}`
  const allReady = players.length >= 2 && players.every(p => p.ready)

  return (
    <main className="palermoShell">
      <div className="palermoNoise" />
      <header className="palermoTop">
        <div className="palermoBrand">PALERMO <span>// ONLINE</span></div>
        <div className="palermoBadge">{connectionState === 'connected' ? 'REAL-TIME LOBBY' : 'BROWSER GAME'}</div>
      </header>

      {screen === 'home' && (
        <section className="palermoHero">
          <div className="palermoEyebrow">SOCIAL DEDUCTION // NO DOWNLOAD</div>
          <h1>PALERMO<br/><span>ONLINE.</span></h1>
          <p>Create a room, send your friends the code, and everyone who joins appears in the lobby for real.</p>

          <div className="palermoEntry card">
            <label>DISPLAY NAME</label>
            <input value={name} onChange={e => setName(e.target.value)} maxLength={18} placeholder="e.g. Soul" />
            <div className="palermoActions">
              <button className="primary" onClick={createRoom} disabled={!name.trim() || connectionState === 'connecting'}>CREATE ROOM</button>
              <button onClick={() => setScreen('join')} disabled={!name.trim()}>JOIN ROOM</button>
            </div>
            {connectionError && <small className="errorText">{connectionError}</small>}
          </div>

          <div className="featureStrip">
            <span>NO ACCOUNT</span><span>REAL PLAYERS</span><span>ROOM CODES</span><span>READY SYSTEM</span><span>ROLE REVEAL</span>
          </div>
        </section>
      )}

      {screen === 'join' && (
        <section className="palermoPanelWrap">
          <button className="backBtn" onClick={() => setScreen('home')}>← BACK</button>
          <div className="card joinCard">
            <div className="palermoEyebrow">JOIN PRIVATE ROOM</div>
            <h2>ENTER CODE</h2>
            <input className="codeInput" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} maxLength={8} placeholder="X7K9Q" />
            <div className="modeSwitch">
              <button className={joinMode === 'player' ? 'active' : ''} onClick={() => setJoinMode('player')}>PLAYER</button>
              <button className={joinMode === 'spectator' ? 'active' : ''} onClick={() => setJoinMode('spectator')}>SPECTATOR</button>
            </div>
            <button className="primary wide" disabled={!joinCode.trim() || connectionState === 'connecting'} onClick={joinRoom}>
              {connectionState === 'connecting' ? 'CONNECTING...' : `JOIN ${joinMode.toUpperCase()}`}
            </button>
            {connectionError && <small className="errorText">{connectionError}</small>}
          </div>
        </section>
      )}

      {screen === 'lobby' && (
        <section className="lobbyWrap">
          <div className="lobbyHead">
            <div>
              <div className="palermoEyebrow">PRIVATE ROOM // {connectionState === 'connected' ? 'CONNECTED' : 'CONNECTING'}</div>
              <h2>ROOM <span>{roomCode}</span></h2>
            </div>
            <button className="copyCode" onClick={() => navigator.clipboard?.writeText(roomCode)}>COPY CODE</button>
          </div>

          <div className="lobbyGrid">
            <div className="card playersCard">
              <div className="cardTitle"><span>PLAYERS</span><b>{players.length}/{maxPlayers}</b></div>
              <div className="playerList">
                {players.map((player, i) => (
                  <div className="playerRow" key={player.id || i}>
                    <span className="avatar">{player.name.slice(0,1).toUpperCase()}</span>
                    <strong>{player.name}{player.isHost ? ' 👑' : ''}</strong>
                    <i className={player.ready ? 'readyDot on' : 'readyDot'} />
                    <small>{player.ready ? 'READY' : 'NOT READY'}</small>
                  </div>
                ))}
                {players.length === 0 && <p>No players yet.</p>}
              </div>
              {joinMode !== 'spectator' && (
                <button className={ready ? 'readyButton active' : 'readyButton'} onClick={toggleReady}>
                  {ready ? '✓ READY' : 'MARK READY'}
                </button>
              )}
            </div>

            <div className="card settingsCard">
              <div className="cardTitle"><span>{isHost ? 'HOST SETTINGS' : 'ROOM SETTINGS'}</span><b>{isHost ? 'HOST' : 'SYNCED'}</b></div>

              <div className="settingsRow">
                <label>MAX PLAYERS <b>{maxPlayers}</b></label>
                <input disabled={!isHost} type="range" min="4" max="16" value={maxPlayers} onChange={e => changeMaxPlayers(e.target.value)} />
              </div>

              <div className="settingsRow">
                <label>MAX SPECTATORS <b>{maxSpectators}</b></label>
                <input disabled={!isHost} type="range" min="0" max="10" value={maxSpectators} onChange={e => changeMaxSpectators(e.target.value)} />
              </div>

              <div className="roleConfig">
                {roles.map(role => (
                  <div className="roleConfigRow" key={role.id}>
                    <span>{role.emoji} {role.label}</span>
                    <div>
                      <button disabled={!isHost || role.count <= role.min} onClick={() => changeRole(role.id, -1)}>−</button>
                      <b>{role.count}</b>
                      <button disabled={!isHost || role.count >= 4} onClick={() => changeRole(role.id, 1)}>+</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="roleTotal">SPECTATORS <b>{spectators.length}/{maxSpectators}</b></div>
              {spectators.map(s => <div className="playerRow" key={s.id}><span className="avatar">{s.name[0]}</span><strong>{s.name}</strong><small>SPECTATOR</small></div>)}
            </div>
          </div>

          <div className="card micCard">
            <div>
              <div className="cardTitle"><span>VOICE CHAT</span><b>{micState === 'granted' ? 'MIC READY' : 'OPTIONAL'}</b></div>
              <p>The browser can request microphone permission now. Actual multi-user voice is the next layer.</p>
              {micError && <small className="errorText">{micError}</small>}
            </div>
            <div className="micActions">
              {micState !== 'granted'
                ? <button onClick={requestMic}>ENABLE MICROPHONE</button>
                : <button className={muted ? 'danger' : 'primary'} onClick={toggleMute}>{muted ? 'UNMUTE' : 'MUTE MIC'}</button>}
            </div>
          </div>

          <div className="lobbyFooter">
            <span>{players.length} REAL PLAYER{players.length === 1 ? '' : 'S'} CONNECTED</span>
            {isHost
              ? <button className="primary startBtn" disabled={!allReady || countdown !== null} onClick={startGame}>
                  {countdown !== null ? `STARTING IN ${countdown}` : allReady ? 'START GAME' : 'WAITING FOR READY'}
                </button>
              : <button className="primary startBtn" disabled>{countdown !== null ? `STARTING IN ${countdown}` : 'WAITING FOR HOST'}</button>}
          </div>

          {connectionError && <div className="prototypeNotice">{connectionError}</div>}
        </section>
      )}

      {screen === 'role' && myRole && (
        <section className="roleRevealWrap">
          <div className="roleReveal card">
            <div className="palermoEyebrow">THIS SCREEN IS PRIVATE</div>
            <div className="roleEmoji">{myRole.emoji}</div>
            <small>YOUR ROLE</small>
            <h2>{myRole.label.toUpperCase()}</h2>
            <p>{myRole.id === 'killer'
              ? 'Work with the other killer. During the night, agree on one target.'
              : myRole.id === 'detective'
              ? 'Investigate one player during the night and use the information carefully.'
              : myRole.id === 'doctor'
              ? 'Protect one player each night.'
              : myRole.id === 'lover'
              ? 'Your fate is linked to another player.'
              : myRole.id === 'kamikaze'
              ? 'Your elimination can trigger a dangerous consequence.'
              : myRole.id === 'madness'
              ? 'Your win condition does not follow the ordinary rules.'
              : 'Find the killers, survive, and vote carefully.'}</p>
            <button className="primary wide" onClick={() => setScreen('game')}>I UNDERSTAND — ENTER GAME</button>
          </div>
        </section>
      )}

      {screen === 'game' && (
        <section className="gameWrap">
          <div className="gameTop">
            <div><small>ROOM {roomCode}</small><h2>ROUND {round}</h2></div>
            <div className={`phasePill ${phase}`}>{phase === 'night' ? '🌙 NIGHT' : phase === 'day' ? '☀️ DAY' : '🗳️ VOTING'}</div>
          </div>

          <div className="gameGrid">
            <div className="card phaseCard">
              {phase === 'night' && <>
                <div className="bigIcon">🌙</div>
                <h3>THE CITY IS SLEEPING</h3>
                <p>Special roles perform their actions. Ordinary citizens wait for morning.</p>
                {isHost && <button className="primary wide" onClick={nextPhase}>RESOLVE NIGHT</button>}
              </>}

              {phase === 'day' && <>
                <div className="bigIcon">☀️</div>
                <h3>DISCUSSION</h3>
                <div className="discussionTimer">{timerText}</div>
                <p>All living players may speak.</p>
                {isHost && <button className="primary wide" onClick={nextPhase}>START VOTE</button>}
              </>}

              {phase === 'vote' && <>
                <div className="bigIcon">🗳️</div>
                <h3>CAST YOUR VOTE</h3>
                <div className="voteList">
                  {players.filter(p => p.name !== name).map(p => (
                    <button className={vote === p.name ? 'selected' : ''} onClick={() => setVote(p.name)} key={p.id}>{p.name}</button>
                  ))}
                  <button className={vote === 'skip' ? 'selected' : ''} onClick={() => setVote('skip')}>SKIP VOTE</button>
                </div>
                <button className="primary wide" disabled={!vote} onClick={finishVote}>LOCK VOTE</button>
              </>}
            </div>

            <div className="sideStack">
              <div className="card miniRole">
                <small>YOUR ROLE</small>
                <strong>{myRole?.emoji} {myRole?.label}</strong>
                <span>ALIVE</span>
              </div>
              <div className="card voiceBox">
                <div className="cardTitle"><span>VOICE</span><b>{micState === 'granted' ? (muted ? 'MUTED' : 'MIC READY') : 'OFF'}</b></div>
                {micState !== 'granted' ? <button onClick={requestMic}>ENABLE MIC</button> : <button onClick={toggleMute}>{muted ? 'UNMUTE' : 'MUTE'}</button>}
                <p>Microphone permission works. Live room audio is the next step.</p>
              </div>
            </div>
          </div>
        </section>
      )}
          <div className="palermoCredit">Made by <b>NEXORA</b></div>
    </main>
  )
}
