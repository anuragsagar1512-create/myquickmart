
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Dashboard(){
  const [orders,setOrders]=useState([]);

  useEffect(()=>{
    supabase.from("orders")
      .select("*")
      .order("created_at",{ascending:false})
      .then(({data})=>setOrders(data||[]));
  },[]);

  const updateStatus=(id,status)=>{
    supabase.from("orders").update({status}).eq("id",id);
  };

  return (
    <div>
      <h2>All Orders</h2>
      {orders.map(o=>(
        <div key={o.id} style={{border:"1px solid #ddd",padding:10,marginBottom:8}}>
          <b>{o.customer_name}</b> ({o.phone})<br/>
          ₹{o.total} | {o.payment_method}<br/>
          Status:
          <select onChange={e=>updateStatus(o.id,e.target.value)} defaultValue={o.status}>
            <option>Placed</option>
            <option>Packed</option>
            <option>Out for Delivery</option>
            <option>Delivered</option>
          </select>
        </div>
      ))}
    </div>
  );
}
