import Button from "react-bootstrap/Button";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPremios, userServices } from "../services/userServices";

export const Dashboard = (props) => {
    const user = JSON.parse(localStorage.getItem("user"));

    const [Userdata, setdata] = useState([]);
    const [UserNegocio, setNegocio] = useState([]);
    const [User, setUser] = useState([]);

    useEffect(() => {
        getPremios().then((premios) => {
            setdata(premios.premioss);
            setNegocio(premios.premioss);
        });
    }, []);

    userServices().then((users) => {
        setUser(users);
    });

    console.log(User);
    let newUser = Userdata.map((values) => {
        return (
            <values
                id={values._id}
                nombre={values.nombre}
                telefonos={values.telefonos}
                genero={values.genero}
                premios={values.premios}
            />
        );
    });
    console.log(newUser);
    return (
        <div className="container">
            <header>
                <h3>
                    Bienvenido <h5 style={{ color: "yellow" }}>{user.name}</h5>{" "}
                    Al juego de la ruleta
                </h3>
                <p>Puedes agregar tu negocio o solo jugar por premios</p>
                <Button variant="outline-warning" href="agregar">
                    Agregar negocio
                </Button>
            </header>
            <br />
            <h2>Negocios</h2>
            <div className="hola-dos">
                {newUser.map((values) => {
                    console.log(values);
                    return (
                        <div className="hola">
                            <div
                                className="card"
                                style={{
                                    width: "14rem",
                                    opacity: 0.5,
                                    marginTop: "10px",
                                }}
                            >
                                <div className="card-body">
                                    <h5 className="card-title">
                                        {values.props.nombre}
                                    </h5>
                                    <p className="card">
                                        {values.props.premios}
                                    </p>

                                    <a
                                        href={`/ruleta/${values.props.id}`}
                                        className="btn btn-primary"
                                    >
                                        Jugar
                                    </a>
                                    <Link to={`/ruleta/${values.props.id}`}>
                                        {user.name}
                                    </Link>
                                </div>
                            </div>
                            `
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
