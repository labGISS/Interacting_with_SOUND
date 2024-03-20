# PRIN Test
# Production
L'esecuzione in un ambiente di produzione avviene mediate Docker. 

Per la configurazione seguire **attentamente** i seguenti passaggi:

1. Configurare il file `docker-compose.yml`

    - Verificare che tutti i domini (cercare `Host`) siano corretti

2. Creare un file `.env` nella root con il seguente contenuto

    ```dosini
    # PRIN PLATFORM CONFIGURATION

    # System
    DEBUG=on
    ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0
    #SCRIPT_NAME=/prin # add a path prefix to all urls

    # Neo4j Database
    DATABASE_HOST=db
    DATABASE_PORT=7687
    DATABASE_PASSWORD=password
    ```

    - Verificare che il parametro `ALLOWED_HOSTS` contenga il dominio corretto
    - Modificare il parametro `DATABASE_PASSWORD`


3. Configurare l'email per la registrazione del certificato LetsEncrypt, nel file `server/traefik.yml`

    ```yml
      # file: server/traefik.yml
      ...
      certificatesResolvers:
        letsEncryptResolver:
            # Enable ACME (Let's Encrypt): automatic SSL.
            acme:
            # Email address used for registration.
            #
            # Required
            #
            email: "example@email.com"  # CHANGE HERE!
    ```

4. Eseguire lo script di inizializzazione `init.sh`

    ```sh
    $ chmod +x init.sh
    $ ./init.sh
    ```

5. Eseguire i container

    ```sh
    $ docker compose up --build -d
    ```

6. Eseguire i seguenti comandi per l'inizializzazione del database, dei file statici e dell'utente Superuser
   
   ```sh
   $ docker exec app python manage.py collectstatic --noinput
   ```


## Development
Install
```shell
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```
