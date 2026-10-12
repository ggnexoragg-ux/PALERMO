'use client'

import { useEffect, useState } from 'react'

export default function PwaInstallPrompt() {
  const [installEvent, setInstallEvent] = useState(null)
  const [installed, setInstalled] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setInstalled(true)
    }

    const onBeforeInstall = (event) => {
      event.preventDefault()
      setInstallEvent(event)
    }
    const onInstalled = () => {
      setInstalled(true)
      setInstallEvent(null)
      setMessage('Palermo has been installed. You can pin it to your taskbar.')
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((error) => {
        console.error('Palermo service worker registration failed:', error)
      })
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  async function install() {
    if (!installEvent) {
      setMessage('To install: open Chrome’s menu (⋮), choose “Save and share” or “Install page as app” if available, then choose Install. You can pin Palermo to the taskbar from its app icon.')
      return
    }
    await installEvent.prompt()
    const choice = await installEvent.userChoice
    if (choice?.outcome === 'accepted') setMessage('Palermo installation started.')
    setInstallEvent(null)
  }

  if (installed) return null

  return (
    <aside style={{position:'fixed',right:18,bottom:18,zIndex:1000,maxWidth:340,padding:16,border:'1px solid #49386b',borderRadius:16,background:'rgba(12,10,18,.96)',color:'#f5f2ff',boxShadow:'0 12px 40px rgba(0,0,0,.4)',fontFamily:'Arial,Helvetica,sans-serif'}}>
      <div style={{fontWeight:800,marginBottom:6}}>Play Palermo like an app</div>
      <div style={{fontSize:13,lineHeight:1.5,color:'#c9c0da',marginBottom:12}}>Install Palermo in its own window and add it to your Windows taskbar.</div>
      <button type="button" onClick={install} style={{width:'100%',padding:'11px 14px',borderRadius:10,border:'1px solid #8253ff',background:'#8253ff',color:'#fff',fontWeight:800,cursor:'pointer'}}>Install Palermo</button>
      {message ? <p role="status" style={{fontSize:12,lineHeight:1.5,color:'#c9c0da',margin:'10px 0 0'}}>{message}</p> : null}
    </aside>
  )
}
