import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';

import { useEffect, useState } from 'react';
import { getPremios } from '../services/userServices';

export const Dashboard = () => {
    const [Userdata, setdata] = useState([]);
    const [UserNegocio, setNegocio] = useState([]);
    const [Usertel, setUsertel] = useState('');

    useEffect(() => {
        getPremios().then((premios) => {
            setdata(premios.premioss[0].premios[0]);
            setNegocio(premios.premioss[0].premios[0].principales[0]);
            setUsertel(premios.premioss[0].premios[0].principales[2]);
        });
    }, []);

    let imprimir = `<div class="card" style="width: 18rem;">
  <img src="..." class="card-img-top" alt="...">
  <div class="card-body">
    <h5 class="card-title">${UserNegocio}</h5>
    <p class="card-text">${Userdata._input}</p>
    <a href="ruleta" class="btn btn-primary">Jugar</a>
  </div>
</div>`;

    return (
        <>
            <div dangerouslySetInnerHTML={{ __html: imprimir }}></div>
            <header>
                <h3>Bienvenido al juego de la ruleta</h3>
                <p>Puedes agregar tu negocio o solo jugar por premios</p>
                <Button variant="outline-warning" href="agregar">
                    Agregar negocio
                </Button>
            </header>
            <br />
            <Card border="warning" style={{ width: '18rem' }}>
                <Card.Header>{UserNegocio}</Card.Header>
                <Card.Body>
                    <Card.Title>{}</Card.Title>
                    <Card.Subtitle>Telefono:{Usertel}</Card.Subtitle>
                    <br />
                    <Card.Subtitle>
                        <h3>Premios</h3>
                    </Card.Subtitle>
                    <Card.Text>{Userdata._input}</Card.Text>
                    <Button variant="outline-warning" href="ruleta">
                        Jugar
                    </Button>
                </Card.Body>
            </Card>
            <br />
            <Card border="info" style={{ width: '18rem' }}>
                <Card.Header>{}</Card.Header>
                <Card.Body>
                    <Card.Title>Info Card Title</Card.Title>
                    <Card.Text>
                        Some quick example text to build on the card title and
                        make up the bulk of the card's content.
                    </Card.Text>
                </Card.Body>
            </Card>
            <br />
        </>
    );
};
