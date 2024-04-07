import { ApolloServer, gql } from "apollo-server";
import pkg from 'faunadb';
const { Client, Map, Paginate, Collection, Lambda, Get, Documents } = pkg;


const client = new Client({
    secret: 'fnAFcUs2BgAASX-dEaDkemV0SU_DE2OsqzTCfOGm',
    domain: 'db.us.fauna.com',
    port: 443,
    scheme: 'https',
});

const typeDefs = gql`
  type Carta {
    Titulo: String
    Tipo: String
    Habilidades: String
    Descripcion: String
    Imagen: String
    Promedio: Float
  }

  type Query {
    GetCartas: [Carta]
    SumaPromediosCartas: Float
    sumaNumeros(numeros: [Float!]!): Float
  }
`;

const resolvers = {
    Query: {
        GetCartas: async () => {
            const response = await client.query(
                Map(
                    Paginate(Documents(Collection('Cartas'))),
                    Lambda((x) => Get(x))
                )
            );

            // Extraemos solo los datos de los documentos
            const cartas = response.data.map(item => item.data);

            return cartas;
        },
        SumaPromediosCartas: async (_, { cartas }) => {
            const promedios = cartas.map(carta => carta.Promedio);
            const sumaPromedios = promedios.reduce((acc, promedio) => acc + promedio, 0);
            return sumaPromedios;
        },
        sumaNumeros: (_, { numeros }) => {
            return numeros.reduce((acc, num) => acc + num, 0);
        }
    },
};

const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
});

server.listen().then(({ url }) => {
    console.log(`Server ready at ${url}`);
});
