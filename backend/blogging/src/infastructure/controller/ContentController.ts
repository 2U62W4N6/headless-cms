import express from 'express';
import WriteContentUseCase from "../../domain/usecases/WriteContentUseCase";
import WriteContentCommand from "../../domain/commands/WriteContentCommand";
import ListAllContentsUseCase from "../../domain/usecases/ListAllContentsUseCase";
import ViewContentUseCase from "../../domain/usecases/ViewContentUseCase";
import ViewContentCommand from "../../domain/commands/ViewContentCommand";
import moment from "moment";
import {ListAllContentsCommand} from "../../domain/commands/ListAllContentsCommand";
import ListAllContentsUsersUseCase from "../../domain/usecases/ListAllContentsUsersUseCase";
import {ListAllContentsfromSpacesCommand} from "../../domain/commands/ListAllContentsfromSpacesCommand";

class ContentController {
    constructor(private writeContentUseCase: WriteContentUseCase,
                private listAllContentsUseCase: ListAllContentsUseCase,
                private listAllContentsUsersUseCase: ListAllContentsUsersUseCase,
                private viewContentUseCase: ViewContentUseCase) {
    }

    routes(): express.Router {
        const router = express.Router();

        router.post('/spaces/:spaceId/', async (req, res) => {
            const command = new WriteContentCommand(
                req.body.schemaId,
                <string>req.headers._creatorId,
                req.params.spaceId,
                req.body.contentName,
                req.body.content,
                <string | undefined>req.query.dateFormat,
            );

            try {
                const writtenContentEvent = await this.writeContentUseCase.execute(command);
                res.send({
                    contentId: writtenContentEvent.contentId,
                    creatorId: writtenContentEvent.creatorId,
                    creationDate: this.format(writtenContentEvent.creationDate, command.dateFormat),
                    content: writtenContentEvent.content
                });
            } catch (e) {
                res.status(400).send('post body is invalid');
            }
        });

        router.get('/spaces/:spaceId', async (req, res) => {
            const command = new ListAllContentsCommand(
                <string>req.headers._creatorId,
                req.params.spaceId,
                <string | undefined>req.query.dateFormat);

            try {
                const writtenContentEvent = await this.listAllContentsUseCase.execute(command);

                const response = writtenContentEvent.content
                                                    .map(({id, name, creationDate}) => ({
                                                        id,
                                                        name,
                                                        creationDate: this.format(creationDate, command.dateFormat)
                                                    }));
                res.send(response);
            } catch (e) {
                res.status(400).send('post body is invalid');
            }
        });

        router.get('/', async (req, res) => {

            const command = new ListAllContentsfromSpacesCommand(
                <string>req.headers._creatorId,
                <string | undefined>req.query.dateFormat);

            try {
                const writtenContentEvent = await this.listAllContentsUsersUseCase.execute(command);

                const response = writtenContentEvent.spaces.map(space => ({
                    space: space.space,
                    content: space.contents.map(content => ({
                        id: content.id,
                        name: content.name,
                        creationDate: this.format(content.creationDate, command.dateFormat)
                    }))
                }));

                res.send(response);
            } catch (e) {
                res.status(400)
            }
        });

        router.get('/:contentId/spaces/:spaceId', async (req, res) => {
            const command = new ViewContentCommand(
                <string>req.headers._creatorId,
                req.params.spaceId,
                req.params.contentId,
                <string | undefined>req.query.dateFormat
            );

            try {
                const viewedContentEvent = await this.viewContentUseCase.execute(command);
                res.send({
                    id: viewedContentEvent.id,
                    name: viewedContentEvent.name,
                    creationDate: this.format(viewedContentEvent.creationDate, command.dateFormat),
                    schema: viewedContentEvent.schema,
                    mapping: viewedContentEvent.mapping
                });
            } catch (e) {
                res.status(400).send('post body is invalid');
            }
        });

        return router;
    }


    private format(from: Date, to: string): string {
        return moment(from).format(to)
    }
}

export default ContentController;