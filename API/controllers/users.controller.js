const User = require('../models/User');
const bcrypt = require('bcryptjs');
const sendMail = require('../providers/mailProvider');
const crypto = require('crypto')
const jwt = require('jsonwebtoken');
const { use } = require('../routes/users.routes');

exports.findAll = async (req, res) => {
    await User.findAll({
        attributes: ['id', 'name', 'email'],
        order:[['name', 'ASC']]
    })
    .then( (users) =>{
        return res.json({
            erro: false,
            users
        });
    }).catch( (err) => {
        return res.status(400).json({
            erro: true,
            mensagem: `Erro: ${err} ou Nenhum Usuário encontrado!!!`
        })
    })


};

exports.findOne = async (req, res) => {
    const { id } = req.params;
    try {
        // await User.findAll({ where: {id: id}})
        const users = await User.findByPk(id);
        if(!users){
            return res.status(400).json({
                erro: true,
                mensagem: "Erro: Nenhum Usuário encontrado!"
            })
        }
        res.status(200).json({
            erro:false,
            users
        })
    } catch (err){
        res.status(400).json({
            erro: true,
            mensagem: `Erro: ${err}`
        })
    }
};

exports.create = async (req, res) => {

    var dados = req.body;
    dados.password = await bcrypt.hash(dados.password, 8);
    let email = dados.email;
    let name = dados.name;
    let gender = dados.gender;

    await User.create(dados)
    .then( ()=>{
        /* enviar e-mail */
        let to = email;
        let cc = '';
        var htmlbody = "";
        htmlbody += '<div style="background-color:#000; margin-bottom:150px;">';
        htmlbody += '<div style="margin-top:150px;">';
        htmlbody += '<p style="color:#fff; font-weight:bold;margin-top:50px;">';
        htmlbody += 'Olá {name},';
        htmlbody += '</p>';
        htmlbody += '<p style="color:#fff; font-style:italic;margin-top:50px;">';
        htmlbody += 'Sua conta foi criada com sucesso!';
        htmlbody += '</p>';
        htmlbody += '<p style="color:#fff;margin-top:50px;">';
        htmlbody += 'Seu login é o seu email: {email}';
        htmlbody += '</p>';
        htmlbody += '<p style="color:#fff;margin-top:50px;">';
        htmlbody += 'Sexo: {gender}';
        htmlbody += '</p>';
        htmlbody += '</div>';
        htmlbody += '</div>';
        htmlbody = htmlbody.replace('{name}', name);
        htmlbody = htmlbody.replace('{email}', email);
        htmlbody = htmlbody.replace('{gender}', gender);
        /* ************* */
        sendMail(to, cc, 'Sua conta foi criada com sucesso!', htmlbody);

        return res.json({
            erro: false,
            mensagem: 'Usuário cadastrado com sucesso!'
        });
    }).catch( (err)=>{
        return res.status(400).json({
            erro:true,
            mensagem: `Erro: Usuário não cadastrado... ${err}`
        })
    })
};

exports.update = async (req, res) => {
    const { id } = req.body;
    var dados = req.body;
    dados.password = await bcrypt.hash(dados.password, 8);

    await User.update(req.body, {where: {id}})
    .then(() => {
        return res.json({
            erro:false,
            mensagem: 'Usuário alterado com sucesso!'
        })
    }).catch( (err) =>{
        return res.status(400).json({
            erro: true,
            mensagem: `Erro: Usuário não alterado ...${err}`
        })
    })
};

exports.delete = async (req, res) => {
    const { id } = req.params;
    await User.destroy({ where: {id}})
    .then( () => {
        return res.json({
            erro: false,
            mensagem: "Usuário apagado com sucesso!"
        });
    }).catch( (err) =>{
        return res.status(400).json({
            erro: true,
            mensagem: `Erro: ${err} Usuário não apagado...`
        });
    });
};

exports.login = async (req, res) => {
    await sleep(1000);
    function sleep(ms){
        return new Promise( (resolve) => {
            setTimeout(resolve,ms)
        })
    }

    const user = await User.findOne({
        attributes: ['id', 'name', 'email', 'password'],
        where: {
            email: req.body.email
        }
    })
    if(user === null){
        return res.status(400).json({
            erro: true,
            mensagem:"Erro: Email ou senha incorreta!!"
        })
    }
    if(!(await bcrypt.compare(req.body.password, user.password))){
        return res.status(400).json({
            erro: true,
            mensagem: "Erro: Email ou senha incorreta!!!"
        })
    }

    var token = jwt.sign({ id: user.id }, process.env.SECRET, {
        expiresIn: 600 // 10min
        // expiresIn: 60 // 1min
    });

    return res.json({
        erro:false,
        mensagem: "Login realizado com sucesso!!!",
        token
    })
};

exports.password = async (req, res) => {
    const {id, password } = req.body;
    var senhaCrypt = await bcrypt.hash(password, 8);

    const users = await User.findByPk(id);
        if(!users){
            return res.status(400).json({
                erro: true,
                mensagem: "Erro: Nenhum Usuário encontrado!"
            })
    }
    await User.update({password: senhaCrypt }, {where: {id: id}})
    .then(() => {
        return res.json({
            erro: false,
            mensagem: "Senha editada com sucesso!"
        }); 
    }).catch( (err) => {
        return res.status(400).json({
            erro: true,
            mensagem: `Erro: ${err}... A senha não foi alterada!!!`
        })
    })
};

exports.recovery = async (req, res) => {
    var dados = req.body;
    let email = dados.email;
    const token = crypto.randomBytes(3).toString('hex')
    const verificationCode = token

    const user = await User.findOne({
        attributes: ['id', 'name', 'email'],
        where: {
            email: req.body.email
        }
    })
    if(user === null){
        return res.status(400).json({
            erro: true,
            mensagem:"Erro: Email incorreto!!!"
        })
    }
    await User.findByPk(user.email);
        if(!user.email){
            return res.status(400).json({
                erro: true,
                mensagem: "Erro: Nenhum Usuário encontrado!"
            })
    } else {
        await User.update({ verificationCode }, {where: {id: user.id}})
        .then(() => {
            let to = email;
            let cc = '';
            var htmlbody = "";
            htmlbody += '<div style="background-color:#fff; margin-bottom:150px;">';
            htmlbody += '<div style="margin-top:150px;">';
            htmlbody += '<p style="color:#000; font-weight:bold;margin-top:30px;">';
            htmlbody += 'Olá {name},';
            htmlbody += '</p>';
            htmlbody += '<p style="color:#000;margin-top:30px;">';
            htmlbody += 'Seu codigo foi enviado no email: {email}';
            htmlbody += '</p>';
            htmlbody += '<p style="color:#000;margin-top:30px;">';
            htmlbody += 'Token: {token}';
            htmlbody += '</p>';
            htmlbody += '<p style="color:#000;margin-top:30px;">';
            htmlbody += 'Acesse o Link abaixo para ser redirecionado para o formulário de alteração de senha';
            htmlbody += '</p>';
            htmlbody += '<p style="color:#000;margin-top:30px;">';
            htmlbody += '<a style="color=#000;" href="http://127.0.0.1:5173/updatepassword"> LINK </a>';
            htmlbody += '</p>';
            htmlbody += '</div>';
            htmlbody += '</div>';
            htmlbody = htmlbody.replace('{name}', user.name);
            htmlbody = htmlbody.replace('{email}', email);
            htmlbody = htmlbody.replace('{token}', token);
            htmlbody = htmlbody.replace('{PORT}', process.env.PORT);
            sendMail(to, cc, 'Confirme sua alteração de senha', htmlbody);
            
            return res.json({
                erro: false,
                mensagem: "Codigo de verificação enviado com sucesso!"
            }); 
        }).catch( (err) => {
            return res.status(400).json({
                erro: true,
                mensagem: `Erro: ${err}... O email não foi enviado`
            })
        })
    }
};

exports.updatepassword = async (req, res) => {

    var dados = req.body;
    let email = dados.email;

    const { password2, confirmpassword } = req.body;

    const user = await User.findOne({
        attributes: ['id', 'name', 'email', 'password'],
        where: {
            email: req.body.email
        }
    })

    const token = await User.findOne({
        attributes: ['verificationCode'],
        where: {
            verificationCode: req.body.verificationCode
        }
    })
    
    if(user === null){
        return res.status(400).json({
            erro: true,
            mensagem:"Erro: Email incorreto!!!"
        })
    }
    if(token === null){
        return res.status(400).json({
            erro: true,
            mensagem:"Erro: token incorreto!!!"
        })
    }
    console.log(password2)
    console.log(confirmpassword)
    if(password2 !== confirmpassword){
        return res.status(400).json({
            erro: true,
            mensagem:"Erro: As senhas são diferentes!!!"
        })
    }     
    var senhaCrypt = await bcrypt.hash(password2, 8);
    senhaCrypt = await User.update({ password: senhaCrypt }, {where: {id: user.id}})
    .then(() => {
        let to = email;
        let cc = '';
        var htmlbody = "";
        htmlbody += '<div style="background-color:#fff; margin-bottom:150px;">';
        htmlbody += '<div style="margin-top:150px;">';
        htmlbody += '<p style="color:#000; font-weight:bold;margin-top:30px;">';
        htmlbody += 'Olá {name},';
        htmlbody += '</p>';
        htmlbody += '<p style="color:#000; margin-top:30px;">';
        htmlbody += 'Sua Senha foi alterada com sucesso!!!';
        htmlbody += '</p>';
        htmlbody += '</div>';
        htmlbody += '</div>';
        htmlbody = htmlbody.replace('{name}', user.name);
        sendMail(to, cc, 'Confirme sua alteração de senha', htmlbody);

        return res.status(200).json({
            erro: false,
            mensagem: "Senha editada com sucesso!"
        }); 
    }).catch( (err) => {
        return res.status(400).json({
            erro: true,
            mensagem: `Erro: ${err}... A senha não foi alterada!!!`
        })
    })
}