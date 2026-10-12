export const metadata = {
  title: 'Download Palermo for Windows',
  description: 'Get the Palermo desktop app for Windows and play online with friends.'
}

export default function DownloadPage() {
  return (
    <main style={{minHeight:'100vh',background:'radial-gradient(circle at 50% 0%,rgba(130,83,255,.2),transparent 42%),#08070d',color:'#f5f2ff',fontFamily:'Arial,Helvetica,sans-serif',padding:'28px 22px'}}>
      <div style={{maxWidth:900,margin:'0 auto'}}>
        <a href="/" style={{color:'#c6b3ff',textDecoration:'none',fontWeight:900,letterSpacing:'.12em'}}>PALERMO <span style={{color:'#8d5cff'}}>ONLINE</span></a>
        <section style={{padding:'12vh 0 7vh'}}>
          <div style={{color:'#9b74ff',fontSize:12,fontWeight:800,letterSpacing:'.22em',marginBottom:18}}>PALERMO // WINDOWS EDITION</div>
          <h1 style={{fontSize:'clamp(46px,9vw,88px)',lineHeight:.95,letterSpacing:'-.055em',margin:'0 0 24px'}}>Your table.<br/><span style={{color:'#8d5cff'}}>Your crew.</span></h1>
          <p style={{fontSize:18,lineHeight:1.7,color:'#b7afc9',maxWidth:650}}>Play Palermo from a dedicated Windows desktop app. The game connects to Palermo’s online services, so you can play with friends using the website too.</p>
          <a href="https://github.com/ggnexoragg-ux/PALERMO/releases/latest/download/Palermo-Setup.exe" style={{display:'inline-flex',alignItems:'center',justifyContent:'center',marginTop:20,padding:'16px 24px',borderRadius:11,background:'#8253ff',color:'#fff',fontWeight:900,textDecoration:'none',boxShadow:'0 12px 36px rgba(130,83,255,.24)'}}>Download for Windows (64-bit)</a>
          <p style={{color:'#8f85a7',fontSize:13,lineHeight:1.6,marginTop:14}}>Windows 10/11 · 64-bit · Internet connection required</p>
        </section>
        <section style={{border:'1px solid #2d263d',borderRadius:16,background:'rgba(20,17,29,.72)',padding:24,marginBottom:22}}>
          <h2 style={{marginTop:0,fontSize:20}}>Before you install</h2>
          <ol style={{color:'#b7afc9',lineHeight:1.9,paddingLeft:22}}>
            <li>Download <strong style={{color:'#f5f2ff'}}>Palermo-Setup.exe</strong>.</li>
            <li>Open the installer and follow the Windows setup steps.</li>
            <li>Launch Palermo and connect to the internet to play.</li>
          </ol>
          <p style={{color:'#8f85a7',fontSize:13,lineHeight:1.7,marginBottom:0}}>This is the desktop edition of the online game, not an offline copy. Multiplayer and account features require Palermo’s online services. If Windows shows a SmartScreen warning for a new, unsigned release, verify that you downloaded the installer from this official page before choosing whether to continue.</p>
        </section>
        <p style={{fontSize:13,color:'#8f85a7'}}>Prefer no download? <a href="/" style={{color:'#c6b3ff'}}>Play in your browser</a>.</p>
      </div>
    </main>
  )
}
