
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Products(){
  const [products,setProducts]=useState([]);

  useEffect(()=>{
    supabase.from("products").select("*").then(({data})=>setProducts(data||[]));
  },[]);

  return (
    <div>
      <h2>Products</h2>
      {products.map(p=>(
        <div key={p.id}>
          {p.name} - ₹{p.price} (Stock {p.stock})
        </div>
      ))}
    </div>
  );
}
