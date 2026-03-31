# Welcome, Reelora Contributor

[Setting Up the Development Environment](#setting-up-the-development-environment)

[Pull Requests](#pull-requests)

## Setting Up the Development Environment

1. Fork the repository.
2. In your terminal, run the `git clone` command with the forked repository's URL, e.g.

    ``` bash
    git clone https://github.com/JohnDoe/reelora.git
    ```

    This creates a local repository on your machine.

3. To keep your fork up to date with the development branch of the company's repository, run the following command.

    ```bash
    git config remote.upstream.fetch "+refs/heads/development:refs/remotes/upstream/development" 
    ```

    Now, when you run `git fetch upstream`, Git will only fetch `upstream/development`.

4. If you decide to pull in the updates, then use the following command.

    ``` bash
    git pull upstream development
    ```

5. Run `git remote -v` to verify. You should see this.

    ``` bash
    origin    https://github.com/JohnDoe/reelora.git (fetch)
    origin    https://github.com/JohnDoe/reelora.git (push)
    upstream  https://github.com/next-college/reelora.git (fetch)
    upstream  https://github.com/next-college/reelora.git (push)
    ```

    *N/B*: If the origin does not show the forked repository's URL, use the command below to add it and then run `git remote -v` again to verify.

    ``` bash
    git remote add origin https://github.com/JohnDoe/EleQ.git
    ```

6. Run `npm install` from the root of your project to install already set up dependencies. Cheers! You're all set. Well done. 🎉

## Pull Requests

For a consistent PR pattern that is easy to understand, use the following convention for PR titles: `<type>: <brief description>`. Common types include:

- **feat** — new feature
- **fix** — bug fix
- **docs** — documentation changes
- **refactor** — code restructuring without changing behaviour
- **test** — adding or updating tests
- **chore** — maintenance tasks (dependencies, configs)
- **perf** — performance improvements
- **style** — formatting, missing semicolons, etc.
