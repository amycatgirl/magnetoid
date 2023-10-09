import { Component } from "solid-js"

const Home: Component = () => {
    return (
        <div class="m-5 prose">
            <h1>Magnetoid</h1>
            {window.location.hostname === "localhost" && (
                <h3>Running on Local Server</h3>
            )}
            <p>A lightweight client for revolt.chat made with SolidJS</p>
            <br />
            <h3>Contributors</h3>
            <hr />
            <p>Insert: Helped me with Mobx and Revolt.js issues</p>
            <p>
                RyanSolid:{" "}
                <a href='https://codesandbox.io/s/mobx-external-source-0vf2l?file=/index.js'>
                    This
                </a>{" "}
                code snippet
            </p>
            <p>
                VeiledProduct80: Help me realize i forgot the masquerade part
            </p>
            <p>
                Mclnooted: <b>sex</b>
            </p>
        </div>
    )
}

export default Home;