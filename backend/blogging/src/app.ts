import express from 'express';
import bodyParser from 'body-parser'

import SpaceController from "./infastructure/controller/RepositoryController";
import OpenSpaceUseCase from "./domain/usecases/OpenSpaceUseCase";
import InMemorySpaceRepository from "./infastructure/repositories/InMemorySpaceRepository";
//import FireBaseSpaceRepository from "./infastructure/repositories/FireBaseSpaceRepository";
import GlobalUniqueIdGenerator from "./shared/GlobalUniqueIdGenerator";
import SchemaController from "./infastructure/controller/SchemaController";
import DefineSchemaUseCase from "./domain/usecases/DefineSchemaUseCase";
import InMemoryCreatorRepository from "./infastructure/repositories/InMemoryCreatorRepository";
import InMemoryTypeRepository from "./infastructure/repositories/InMemoryTypeRepository";
import Creator from "./domain/entities/Creator";
import TypeFactory from "./domain/factories/TypeFactory";
import ContentController from "./infastructure/controller/ContentController";
import WriteContentUseCase from "./domain/usecases/WriteContentUseCase";

const app = express();
const port = 3000;


const creatorRepository = new InMemoryCreatorRepository();
creatorRepository.add(new Creator('1', new Map(), new Map()));

const spaceController = new SpaceController(new OpenSpaceUseCase(new InMemorySpaceRepository(), creatorRepository, new GlobalUniqueIdGenerator()));
const schemaController = new SchemaController(new DefineSchemaUseCase(new GlobalUniqueIdGenerator(), creatorRepository, new InMemoryTypeRepository(), new TypeFactory()));
const contentController = new ContentController(new WriteContentUseCase(creatorRepository, new GlobalUniqueIdGenerator(), new TypeFactory()));
//const spaceController = new SpaceController(new OpenSpaceUseCase(new FireBaseSpaceRepository(), new GlobalUniqueIdGenerator()));


app.use(bodyParser.json());
app.use('/spaces', spaceController.routes());
app.use('/schemas', schemaController.routes());
app.use('/contents', contentController.routes());

app.get('/', (req, res) => res.send('Hello World!'));

app.listen(port, () => console.log(`Server listening at port ${port}`));