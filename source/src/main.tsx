import {useState} from 'react';
import {createRoot} from 'react-dom/client';
import Invitation from './invitation';
import Editor from './editor';
import {Settings,defaults,publicSettings} from './config';
import {login,logout,repository} from './github';
import './style.css';
function Admin(){
 const [data,setData]=useState<Settings|null>(null),[secret,setSecret]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 async function enter(e:React.FormEvent){e.preventDefault();setBusy(true);setError('');const value=secret;setSecret('');try{setData(await login(value))}catch(err){setError(err instanceof Error?err.message:'Login gagal.')}finally{setBusy(false)}}
 if(data)return <><div className="github-session"><span>GitHub Pages · {repository}</span><button onClick={logout}>Keluar</button></div><Editor initial={data} version={0} displayName="Admin GitHub" signOut="./admin.html"/><div className="publish-note">Foto, musik, dan data yang disimpan masuk repositori publik. Publikasi GitHub Pages membutuhkan sekitar 1–3 menit.</div></>;
 return <div className="login"><form className="login-card" onSubmit={enter}><span className="kicker">UNDANGAN STUDIO</span><h1>Login Admin</h1><p>Kelola undangan langsung di GitHub.<br/>Tidak perlu akun ChatGPT.</p><label className="field" style={{textAlign:'left'}}><span>Token GitHub khusus undangan</span><input required autoComplete="off" type="password" value={secret} onChange={e=>setSecret(e.target.value)} placeholder="Masukkan token GitHub"/></label><button className="button" disabled={busy}>{busy?'Memeriksa akses…':'Masuk Admin'}</button><p role="status">{error}</p><details><summary>Cara menyiapkan akses admin</summary><ol style={{textAlign:'left',font:'12px/1.8 Arial'}}><li>Buka GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens.</li><li>Pilih pemilik Hiijee220, hanya repositori <b>undangan-nikah-taman-romantis-web</b>, dan masa berlaku yang sesuai.</li><li>Beri izin <b>Contents: Read and write</b>. Buat token, lalu masukkan sendiri pada kolom login di atas.</li></ol><a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noreferrer">Buka pengaturan token GitHub ↗</a></details><p className="muted">Token hanya berada dalam memori tab ini. Muat ulang atau keluar untuk mengakhiri sesi. Jangan kirim token melalui chat.</p><a href="./">Lihat undangan ↗</a></form></div>;
}
async function start(){
 const root=createRoot(document.getElementById('root')!);
 if(location.pathname.endsWith('/admin.html')){root.render(<Admin/>);return;}
 try{
  const response=await fetch('./data.json?t='+Date.now(),{cache:'no-store'});
  if(!response.ok)throw new Error('Data belum tersedia.');
  const data={...defaults,...await response.json()};
  root.render(<Invitation settings={publicSettings(data)}/>);
 }catch{root.render(<div className="login"><div className="login-card"><h1>Undangan sedang diperbarui</h1><p>Silakan coba lagi sebentar.</p><button className="button" onClick={()=>location.reload()}>Muat ulang</button></div></div>);}
}
void start();
