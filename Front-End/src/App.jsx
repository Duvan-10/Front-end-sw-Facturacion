// Front-end/src/App.jsx (VERSIÓN CORREGIDA Y COMPLETA)

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// 1. Importaciones de componentes
import Login from './modules/Auth/Login.jsx'; 
import Layout from './components/Layout/Layout.jsx'; 
import Home from './view/Home.jsx';   


// 🚨 NECESITAS IMPORTAR TODOS TUS MÓDULOS
import Menu from './view/Menu.jsx';
import Dashboard from './modules/Dashboard/Dashboard.jsx';
import Clientes from './modules/Clientes/Clientes.jsx'; 
import Facturas from './modules/Facturas/Facturas.jsx'; 
import Productos from './modules/Productos/Productos.jsx';
import Reportes from './modules/Reportes/Reportes.jsx';

function App() {
return (
<BrowserRouter>
<Routes>

<Route path="/" element={<Login />} />

<Route path="/home" element={<Layout />}> 

<Route index element={<Home />} /> 


{/* 🚨 NECESITAS DEFINIR LAS RUTAS HIJAS DENTRO DEL LAYOUT */}
<Route path="inicio" element={<Menu/>} />
<Route path="dashboard" element={<Dashboard />} />
<Route path="clientes" element={<Clientes />} />
<Route path="facturas" element={<Facturas />} />
<Route path="productos" element={<Productos />} />
<Route path="reportes" element={<Reportes />} />

</Route>

<Route path="*" element={<h1>404 | Página no encontrada</h1>} />

</Routes>
</BrowserRouter>
);
}

export default App;