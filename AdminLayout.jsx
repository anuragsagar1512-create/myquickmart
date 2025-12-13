
import { Outlet, Link } from "react-router-dom";

export default function AdminLayout(){
  return (
    <div style={{display:"flex",minHeight:"100vh"}}>
      <aside style={{width:220,background:"#3BB77E",color:"#fff",padding:20}}>
        <h2>My Quick Mart</h2>
        <nav>
          <Link to="/admin/dashboard">Orders</Link><br/>
          <Link to="/admin/products">Products</Link>
        </nav>
      </aside>
      <main style={{flex:1,padding:20}}>
        <Outlet/>
      </main>
    </div>
  )
}
