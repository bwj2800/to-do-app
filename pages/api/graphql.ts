import "reflect-metadata";
import {ApolloServer} from "apollo-server-micro";
import { buildSchema, Resolver, Query, Arg, ObjectType, Field, ID } from "type-graphql";

@ObjectType()
export class Dog{
    @Field(()=>ID)
    name: string
}

@Resolver(Dog)
export class DogResolver{
    @Query(()=>[Dog])
    dogs(): Dog[]{
        return[
            {name: "Bo"},
            {name: "Lassie"},
        ]
    }
}

const schema=await buildSchema({
    resolvers: [DogResolver]
})

const server = new ApolloServer({
    schema,
});

export const config={
    api:{
        bodyParser: false,
    },
};

const startServer = server.start();

export default async function handler(req, res){
    await startServer;
    await server.createHandler({path: "/api/graphql"})(req, res);
}