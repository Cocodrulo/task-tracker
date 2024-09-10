import { createInterface } from 'node:readline';
import fs from 'node:fs';

const PREFIX = 'task-cli';

const commands = {
    add: {
        name: 'add',
        description: 'Add a new task',
        requiredArguments: true,
        arguments: { task: 'string' },
        action: (args) => {
            if (
                !AddToDB({
                    id: GenerateNewId(),
                    description: args[0],
                    status: 'todo',
                    createdAt: new Date(),
                })
            )
                return console.log(
                    'There was an error trying to add that task'
                );
        },
    },
    list: {
        name: 'list',
        description: 'List all tasks',
        requiredArguments: false,
        arguments: {
            type: { type: 'string', options: ['done', 'in-progress', 'todo'] },
        },
        action: (args) => {
            ListDB(args[0]);
        },
    },
    update: {
        name: 'update',
        description: 'Update a task',
        requiredArguments: true,
        arguments: { id: 'number', newname: 'string' },
        action: (args) => {
            if (UpdateDB(args[0], { field: 'description', value: args[1] }))
                return console.log('Task description updated successfully');
            else
                return console.log(
                    'There was an error updating the task description'
                );
        },
    },
    delete: {
        name: 'delete',
        description: 'Delete a task',
        requiredArguments: true,
        arguments: { id: 'number' },
        action: (args) => {
            if (RemoveFromDB(args[0]))
                return console.log('Task deleted successfully');
            else
                return console.log(
                    'There was an error trying to delete the task'
                );
        },
    },
    'mark-in-progress': {
        name: 'mark-in-progress',
        description: 'Mark a task as in progress',
        requiredArguments: true,
        arguments: { id: 'number' },
        action: (args) => {
            if (UpdateDB(args[0], { field: 'status', value: 'in-progress' }))
                return console.log('Task marked as in progress sucessfully');
            else
                return console.log(
                    'There was an error trying to update the task'
                );
        },
    },
    'mark-done': {
        name: 'mark-done',
        description: 'Mark a task as done',
        requiredArguments: true,
        arguments: { id: 'number' },
        action: (args) => {
            if (UpdateDB(args[0], { field: 'status', value: 'done' }))
                return console.log('Task marked as done succesfully');
            else
                return console.log(
                    'There was an error trying to update the task'
                );
        },
    },
};

const GenerateNewId = () => {
    const DB = fs.existsSync('db.json')
        ? JSON.parse(fs.readFileSync('db.json'))
        : [];

    if (DB.length === 0 || !DB.length) return 1;

    return DB[DB.length - 1] ? DB[DB.length - 1].id + 1 : 1;
};

const getArgs = (argsArray) => {
    const args = [];

    let currentStr = '';

    argsArray.forEach((arg) => {
        if (arg.startsWith('"') && !arg.endsWith('"')) currentStr += arg + ' ';
        else if (arg.endsWith('"') && !arg.startsWith('"')) {
            args.push(currentStr + arg);
            currentStr = '';
        } else if (currentStr !== '') currentStr += arg + ' ';
        else args.push(arg);
    });

    return args;
};

const ListDB = (type = 'all') => {
    try {
        const DB = fs.existsSync('db.json')
            ? JSON.parse(fs.readFileSync('db.json'))
            : [];

        if (!DB.length || DB.length === 0)
            return console.log('There are no tasks');

        const TASKS = DB.filter((el) =>
            type === 'all' ? true : el.status === type
        );

        if (TASKS.length === 0 || !TASKS.length) {
            console.log('Thre is not taks with this status');
            return true;
        }

        TASKS.forEach((el) => {
            console.log(
                `${el.description}: \n- Status: ${el.status}\n- ID: ${
                    el.id
                }\n- createdAt: ${new Date(el.createdAt).toLocaleDateString(
                    'es-ES',
                    {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                    }
                )}\n- updatedAt: ${new Date(el.updatedAt).toLocaleDateString(
                    'es-ES',
                    {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                    }
                )}`
            );
        });

        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
};

const AddToDB = ({ id, description, status, createdAt }) => {
    try {
        const DB = fs.existsSync('db.json')
            ? JSON.parse(fs.readFileSync('db.json'))
            : [];

        DB.push({
            id,
            description,
            status,
            createdAt,
            updatedAt: createdAt,
        });

        console.log(`Task added successfullt (ID: ${id})`);

        fs.writeFileSync('db.json', JSON.stringify(DB, null, 2));
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
};

const UpdateDB = (id, { field, value }) => {
    try {
        const DB = fs.existsSync('db.json')
            ? JSON.parse(fs.readFileSync('db.json'))
            : [];

        const index = DB.findIndex((task) => task.id === id);

        if (index === -1) {
            console.log('There is no task with the provided ID');
            return false;
        }

        DB[index][field] = value;
        DB[index].updatedAt = new Date();

        fs.writeFileSync('db.json', JSON.stringify(DB, null, 2));
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
};

const RemoveFromDB = (id) => {
    try {
        const DB = fs.existsSync('db.json')
            ? JSON.parse(fs.readFileSync('db.json'))
            : [];

        const index = DB.findIndex((task) => task.id === id);

        if (index === -1) {
            console.log('There is no task with the provided ID');
            return false;
        }

        DB.splice(index, 1);

        fs.writeFileSync(
            'db.json',
            JSON.stringify(
                DB.map((el) => (el === null ? undefined : el)),
                null,
                2
            )
        );
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
};

const getProperArgsTypes = (args) => {
    return args.map((arg) => {
        try {
            return eval(arg);
        } catch (e) {
            return arg;
        }
    });
};

const checkCommandArguments = (command, rawCmd) => {
    if (!command.requiredArguments) return true;

    const args = getArgs(rawCmd.slice(2));

    if (args.length === 0) {
        console.log('Arguments were expected, provided none');
        return false;
    }

    if (Object.keys(command.arguments).length !== args.length) {
        console.log(
            `${
                Object.keys(command.arguments).length
            } arguments were expected, provided ${args.length}`
        );
        return false;
    }

    let argChecking = 0;
    for (const argName in command.arguments) {
        const argValue = command.arguments[argName];

        if (typeof argValue === 'string') {
            if (argValue === 'number' && Number(args[argChecking]).isNaN) {
                console.log(
                    `As argument ${argChecking + 1} and a number was epected`
                );
                return false;
            }

            if (
                argValue === 'bool' &&
                (args[argChecking] !== 'true' || args[argChecking] !== 'false')
            ) {
                console.log(
                    `As argument ${argChecking + 1} and a boolean was expected`
                );
                return false;
            }

            try {
                if (
                    argValue === 'string' &&
                    typeof eval(args[argChecking]) !== 'string'
                ) {
                    console.log(
                        `As argument ${
                            argChecking + 1
                        } and a string was epected`
                    );
                    return false;
                }
            } catch (e) {
                console.log(
                    `As argument ${argChecking + 1} and a string was epected`
                );
                return false;
            }
        } else {
            if (argValue.type === 'number' && Number(args[argChecking]).isNaN) {
                console.log(
                    `As argument ${argChecking + 1} and a number was epected`
                );
                return false;
            }

            if (
                argValue.type === 'bool' &&
                (args[argChecking] !== 'true' || args[argChecking] !== 'false')
            ) {
                console.log(
                    `As argument ${argChecking + 1} and a boolean was expected`
                );
                return false;
            }

            try {
                if (
                    argValue.type === 'string' &&
                    typeof eval(args[argChecking]) !== 'string'
                ) {
                    console.log(
                        `As argument ${
                            argChecking + 1
                        } and a string was epected`
                    );
                    return false;
                }
            } catch (e) {
                console.log(
                    `As argument ${argChecking + 1} and a string was epected`
                );
                return false;
            }

            if (!args[argChecking].options.includes(args[argChecking])) {
                console.log(
                    `As argument ${
                        argChecking + 1
                    } it was expected one of theese: ${args[
                        argChecking
                    ].options.join(', ')} but it was provided ${
                        args[argChecking]
                    }`
                );
                return false;
            }
        }

        argChecking++;
    }

    return true;
};

const checkCommandExistense = (rawCmd) => {
    const cmdName = rawCmd[1];

    if (!cmdName) {
        console.log('Please provide a command');
        return false;
    }

    const command = commands[cmdName];
    if (!command) {
        console.log('Unknown command, please try again');
        return false;
    }

    return checkCommandArguments(command, rawCmd);
};

const awaitCommand = (rl) => {
    rl.question('> ', (rawInput) => {
        const rawCommand = rawInput.split(' ').map((el) => el.trim());
        const cmdPrefix = rawCommand[0];

        if (cmdPrefix === 'exit') return rl.close();
        if (cmdPrefix !== PREFIX) {
            console.log('Unknown command, please try again');
            return awaitCommand(rl);
        }

        if (!checkCommandExistense(rawCommand)) return awaitCommand(rl);

        console.log('\n');

        const command = commands[rawCommand[1]];

        command.action(getProperArgsTypes(getArgs(rawCommand.slice(2))));

        console.log('\n');

        awaitCommand(rl);
    });
};

const init = () => {
    console.log('Welcome to the task manager!');
    console.log('Available commands:');
    Object.values(commands).forEach((command) => {
        console.log(`- task-cli ${command.name}: ${command.description}`);
    });
    console.log('\n');

    const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    awaitCommand(rl);
};

init();
