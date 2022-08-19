import React, { useContext } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom'

import { Context } from '../Context/AuthContext';
import { ListaUsuarios } from '../page/Usuarios/listaUsuarios';
import { UsuariosForm } from '../page/UsuariosForm/UsuariosForm';

import { Login } from '../components/Login/Login';
// import { Dashboard } from '../page/Dashboard/index';

function CustomRoute({ isPrivate, ...rest}){

    const { authenticated } = useContext(Context);
    if( isPrivate && ! authenticated){
        return <Redirect to="/" />
    }
    return <Route { ...rest } />

}

export default function PrivateRoute(){
    return(
        <Switch>
              <CustomRoute exact path="/" component={Login} />
        </Switch>
    )
}