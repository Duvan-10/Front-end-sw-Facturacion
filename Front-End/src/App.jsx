// Front-end/src/App.jsx

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// 1. Importaciones de componentes
import Login from './modules/Auth/Login.jsx'; 
import Layout from './components/Layout/Layout.jsx'; 
import Home from './view/Home.jsx';                


function App() {
return (
<BrowserRouter>
<Routes>

 <Route path="/" element={<Login />} />

<Route path="/home" element={<Layout />}> 
 
<Route index element={<Home />} /> 

</Route>

<Route path="*" element={<h1>404 | Página no encontrada</h1>} />

</Routes>
</BrowserRouter>
);
}

export default App;