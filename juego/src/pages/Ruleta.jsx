import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ListGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const Ruleta = (props) => {
    const { id } = useParams();
    const [User, setUser] = useState([]);
    const [ganador, setGanador] = useState(0);
    const [girar, setgirar] = useState("detener");
    const [premios, setPremios] = useState([]);
    const [valuel, setValuel] = useState([]);
    const [colors, setColors] = useState([]);
    const navigate = useNavigate();

    const savedUsert = () => {
        localStorage.setItem("premioss", JSON.stringify(premios));
        return console.log(JSON.parse(localStorage.getItem(premios)));
    };
    const user = JSON.parse(localStorage.getItem("user"));
    const premio = JSON.parse(localStorage.getItem("premioss"));

    const getid = async () => {
        const getId = await axios.get(`http://localhost:5500/negocio/${id}`);
        let ids = await getId.data.premios.premios;
        let ides = await getId.data.premios;
        setUser(ides);
        setValuel(ids);

        setColors(getColors(ids.length));
    };

    useEffect(() => {
        getid();
    }, []);

    function getRandomColor() {
        var letters = "0123456789ABCDEF";
        var color = "#";
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
    const getColors = (number) => {
        let colorArray = [];
        for (let i = 0; i < number; i++) {
            colorArray.push(getRandomColor());
        }
        return colorArray;
    };

    function boton() {
        setgirar("rodar");
        setTimeout(() => {
            setgirar("detener");
            setGanador(Math.floor(Math.random() * 12));
        }, 3000);
    }

    function handleValue(e) {
        let _premios = [...valuel];
        _premios[id] = ganador;
        console.log(_premios);
    }

    function todo() {
        boton();
        handleValue();
    }

    return (
        <div>
            <header>
                <h1>Bienvenido y mucha suerte!!</h1>
                <h2 style={{ color: "white" }}>
                    Negocio <br />
                    {User.nombre}
                </h2>
                <h1>Premio</h1>
                <h2>numero en ruleta</h2>
                <h2>{User.nombre}</h2>
                <h2>{User.genero}</h2>
            </header>
            <br />
            <ul id="ruleta" className={girar}>
                {valuel.map((el, index) => (
                    <li id={index + 1}>
                        <div
                            color={colors[index]}
                            style={{
                                backgroundColor: colors[index],
                                border: "1px solid colors[index]",
                            }}
                            key={colors[index]}
                            className="texto"
                            contentEditable="true"
                            spellCheck="false"
                            suppressContentEditableWarning={true}
                        >
                            {index + 1}
                        </div>
                    </li>
                ))}
            </ul>
            <button onClick={todo} className="RL">
                girar
            </button>

            <div>
                <h1>Felicidades ganaste :</h1>
                <h2>{valuel[ganador - 1]}</h2>
            </div>
            <br />
            <br />
            <div>
                <h3>PREMIOS</h3>
                <ListGroup>
                    {valuel.map((el, index) => (
                        <ListGroup.Item
                            color={colors[index]}
                            style={{
                                backgroundColor: colors[index],
                                outline: colors,
                            }}
                            key={colors[index]}
                        >
                            {el}
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </div>
        </div>
    );
};
