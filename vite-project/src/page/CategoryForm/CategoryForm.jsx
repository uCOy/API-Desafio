import React, { useState, useContext, useEffect } from "react";
import api from '../../services/api';
import { Link, useHistory } from 'react-router-dom';
import Alert from 'react-bootstrap/Alert';
import { Container } from "react-bootstrap";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import '../../components/Login/styles.css';

export const UsuariosForm = (props) => {
  
    const history = useHistory();

    const [id] = useState(props.match.params.id);

    const [user, setUser] = useState({
      email: '',
      password: '',
      verificationCode: ''
    })
    console.log(id)
    
    // const [values, setValues] = useState(initialValue);
    const [acao, setAcao] = useState('Novo');
    const [status, setStatus] = useState({
        type: '',
        mensagem: '',
        loading: false
    })


    var password = document.getElementById("password")   , confirm_password = document.getElementById("confirm_password");  function validatePassword(){   if(password.value != confirm_password.value) {     confirm_password.setCustomValidity("Senhas diferentes!");   } else {     confirm_password.setCustomValidity('');   } }  password.onchange = validatePassword; confirm_password.onkeyup = validatePassword;

    const valorInput = e => setUser({
        ... user,
        [e.target.name]: e.target.value
    })

    useEffect( () => {

      const getUser = async () => {

        await api.get("/user/show/" + id)
            .then( (response) => {
                if(response.data.users){
                  setAcao('Editar')
                } else {
                  setStatus({
                    type: 'warning',
                    mensagem:'Usuário não encontrado!!!'
                  })
                } 
            }).catch( (err) => {
                if(err.response){
                    setStatus({
                        type:'error',
                        mensagem: err.response.data.mensagem
                    })
                } else {
                    setStatus({
                        type:'error',
                        mensagem: 'Erro: tente mais tarde.....!'
                    })
                }
            })
    }
    
    if(id) getUser();
    }, [id])

    const formSubmit = async e => {
        e.preventDefault();
        setStatus({ loading: true });

        if(id){          
        await api.post("/user/updatepassword", user)
            .then( (response) => {
                    console.log(response);
                    setStatus({loading: false});
                    // return history.push('/dashboard')
                }).catch( (err) => {
                    if(err.response){
                        setStatus({
                            type: 'error',
                            mensagem: err.response.data.mensagem,
                            loading: false
                        })
                    } else {
                        setStatus({
                            type: 'error',
                            mensagem: 'Erro: tente mais tarde...',
                            loading: false
                        })                
                    }  
                })
        } else {
          setStatus({
            type:'error',
            mensagem: 'Erro: tente mais tarde.....!'
        })
        }
    }

    return(
        <div>    
            <Container className="box">
              <h1>{acao} Usuário</h1>
              <Form onSubmit={formSubmit} className="borderForm">
                {/* {status.type == 'error' ? <p>{status.mensagem}</p>: ""} */}
                {/* {status.type == 'success' ? <p>{status.mensagem}</p>: ""} */}

                {['success',].map((variant) => (
                  <p>
                    {status.type == 'success' ? 
                    <Alert key={variant} variant={variant}>{status.mensagem}</Alert>: ""}
                  </p>
                ))}
          
                {['danger',].map((variant) => (
                  <p>
                    {status.type == 'error' ? 
                    <Alert key={variant} variant={variant}>{status.mensagem}</Alert>: ""}
                  </p>
                ))}
          
                {['warning'].map((variant) => (
                  <p>
                    {status.loading ?
                  <Alert key={variant} variant={variant}> Enviando... </Alert> : ""}
                  </p>
                ))}
                
                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control type="email" name="email" value={user.email} onChange={valorInput} placeholder="Enter email" />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicCode">
                  <Form.Label>Codigo de Verificação</Form.Label>
                  <Form.Control type="text" name="verificationCode" value={user.verificationCode} onChange={valorInput} placeholder="Enter Code" />
                </Form.Group>  
                {!id &&
                <Form.Group className="mb-3" controlId="formBasicPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control type="password" name="password" onChange={valorInput} id="password" placeholder="Password" />
                </Form.Group>
                }
                {!id &&
                <Form.Group className="mb-3" controlId="formBasicPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control type="password" name="password" onChange={valorInput} id="confirm_password" placeholder="Password" />
                </Form.Group>
                }
                {/* <form class="pure-form">
                    <fieldset>
                        <legend>Confirmação de Senha </legend>

                        <input type="password" placeholder="Senha" id="password" required/>
                        <input type="password" placeholder="Confirme Senha" id="confirm_password" required/>

                        <button type="submit" class="pure-button pure-button-primary">Confirmar</button>
                    </fieldset>
                </form> */}
                {status.loading ? <Button id="button" variant="primary" disabled type="submit" >Enviando...</Button>
                : <Button id="button" variant="primary" type="submit" >Enviar</Button>}
              </Form>
          </Container>
        </div>
    )
}