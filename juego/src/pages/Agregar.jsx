import { Button } from "react-bootstrap";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Form from "react-bootstrap/Form";

import { PremiosDB } from "../services/userServices";
import Modal from "react-bootstrap/Modal";

export const Agregar = () => {
    const [input, setInput] = useState([]);
    const [nombre, setNombre] = useState("");
    const [genero, setGenero] = useState("");
    const [telefonos, setTelefonos] = useState("");
    const navigate = useNavigate();
    const negocio = JSON.parse(localStorage.getItem("negocio"));
    const premios = JSON.parse(localStorage.getItem("premios"));
    const user = JSON.parse(localStorage.getItem("user"));

    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    if (!user) {
        return navigate("/");
    }

    function todos() {
        handleClose();
        inputsis();
    }
    function handleInputs(e) {
        let _input = [...input];
        _input[e.target.id] = e.target.value;
        console.log(_input);
        setInput(_input);
    }

    function inputsis(e) {
        localStorage.setItem(
            "negocio",
            JSON.stringify({ nombre, genero, telefonos })
        );
        localStorage.setItem("premios", JSON.stringify(input));
        PremiosDB(input, nombre, genero, telefonos);
        alert("Premios");
    }

    let _premios = input.map((item) => {
        console.log(item);
        return item;
    });

    console.log(negocio);
    console.log(_premios);

    return (
        <div className="container">
            <h1>Registra tu Empresa</h1>
            <h2>{user.name}</h2>
            <Form>
                <Form.Label>
                    <h2>logo</h2>
                </Form.Label>
                <input type="file" accept="image/*"></input>
                <br />
                <Form.Label>
                    <h2>Nombre</h2>
                </Form.Label>
                <input
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    type="text"
                    className="form-control"
                    placeholder="nombre"
                ></input>
                <br />
                <Form.Label>
                    <h2>Telefonos</h2>
                </Form.Label>
                <input
                    value={telefonos}
                    onChange={(e) => setTelefonos(e.target.value)}
                    type="text"
                    className="form-control"
                    placeholder="telefono"
                ></input>
                <br />
                <Form.Label>
                    <h2>Genero</h2>
                </Form.Label>
                <input
                    value={genero}
                    onChange={(e) => setGenero(e.target.value)}
                    type="text"
                    className="form-control"
                    placeholder="ej. Restaurante"
                ></input>
                <br />
                <Form.Label>
                    <h2>Premios y Descuentos</h2>
                </Form.Label>
                <br />
                <Form.Label>
                    <h4>Posicion 1</h4>
                </Form.Label>
                <input
                    id="0"
                    onChange={handleInputs}
                    name="inpust"
                    type="text"
                ></input>
                <Form.Label>
                    <h4>Posicion 2</h4>
                </Form.Label>
                <input
                    id="1"
                    onChange={handleInputs}
                    name="inpust"
                    type="text"
                ></input>
                <Form.Label>
                    <h4>Posicion 3</h4>
                </Form.Label>
                <input
                    id="2"
                    onChange={handleInputs}
                    name="inpust"
                    type="text"
                ></input>
                <Form.Label>
                    <h4>Posicion 4</h4>
                </Form.Label>
                <input
                    id="3"
                    onChange={handleInputs}
                    name="inpust"
                    type="text"
                ></input>
                <Form.Label>
                    <h4>Posicion 5</h4>
                </Form.Label>
                <input
                    id="4"
                    onChange={handleInputs}
                    name="inpust"
                    type="text"
                ></input>
                <Form.Label>
                    <h4>Posicion 6</h4>
                </Form.Label>
                <input
                    id="5"
                    onChange={handleInputs}
                    name="inpust"
                    type="text"
                ></input>
                <Form.Label>
                    <h4>Posicion 7</h4>
                </Form.Label>
                <input
                    id="6"
                    onChange={handleInputs}
                    name="inpust"
                    type="text"
                ></input>
                <Form.Label>
                    <h4>Posicion 8</h4>
                </Form.Label>
                <input
                    id="7"
                    onChange={handleInputs}
                    name="inpust"
                    type="text"
                ></input>
                <Form.Label>
                    <h4>Posicion 9</h4>
                </Form.Label>
                <input
                    id="8"
                    onChange={handleInputs}
                    name="inpust"
                    type="text"
                ></input>
                <Form.Label>
                    <h4>Posicion 10</h4>
                </Form.Label>
                <input
                    id="9"
                    onChange={handleInputs}
                    name="inpust"
                    type="text"
                ></input>
                <Form.Label>
                    <h4>Posicion 11</h4>
                </Form.Label>
                <input
                    id="10"
                    onChange={handleInputs}
                    name="inpust"
                    type="text"
                ></input>
                <Form.Label>
                    <h4>Posicion 12</h4>
                </Form.Label>
                <input
                    id="11"
                    onChange={handleInputs}
                    name="inpust"
                    type="text"
                ></input>
                <br />
                <Button
                    type="button"
                    variant="outline-light"
                    onClick={handleShow}
                >
                    Veryficar
                </Button>
            </Form>

            <>
                <Modal
                    show={show}
                    onHide={handleClose}
                    backdrop="static"
                    keyboard={false}
                    style={{ backgroundColor: "violet", opacity: 0.8 }}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>{nombre}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <h3>tel: {telefonos}</h3>
                        <h3>genero: {genero}</h3>
                        <h4>Premios</h4>
                        <h5>{_premios}</h5>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose}>
                            Cerrar
                        </Button>
                        <Button onClick={todos} variant="primary">
                            Agregar
                        </Button>
                    </Modal.Footer>
                </Modal>
            </>
        </div>
    );
};
