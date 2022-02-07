# Database model
Il concetto che si vuole modellare con questo database è che esistono due tipi di `Cluster` (`Emerging` ed `Exporting`), ciascun Cluster è composto
da un certo numero di `Ateco` (che appartengono quindi a un `Cluster`). In ogni `Cluster`, ogni `Ateco` è in relazione con uno o più `Sll`. Ogni relazione
tra `Ateco` e `Sll` contiente un certo numero di attributi i cui valori dipendono dal `Cluster` cui appartiene l'`Ateco`. Esiste quindi una sorta di
dipendenza funzionale tra le relazioni: 

```
una relazione Ateco->Sll dipende funzionalmente dalla relativa relazione Cluster->Ateco
```

Per modellare questa dipendenza ogni relazione `Ateco`->`Sll` avrà un attributo aggiuntivo "cluster", col vincolo che il valore di tale attributo
deve essere uguale a nome di uno dei cluster.

## Model
La struttura del database prevede 3 tipi di nodi:
- Ateco{code, desctription} [1..n] -> n = numero totale di Ateco
- Sll{code, name, loc} [1..m] -> m = numero totale di Sll
- Cluster{name}

L'ultimo nodo (Cluster) a sua volta si divide in due tipi di nodi
- Emerging
- Exporting


Questi nodi sono collegati tra di loro mediate due tipi di relazione:
- CLUSTER_CONTIENE(Cluster, Ateco) -> Ogni Cluster contiene [1..n] Ateco
- CLUSTER_RELAZIONA(Ateco, Sll) {cluster, year, units, employees_avg} -> Ogni relazione tra Cluster->Ateco genera [0..m] relazioni tra Ateco e Sll

Lo schema delle relazioni è il seguente:

```
Emerging<-\ 
           \
            \ CLUSTER_CONTIENE[1..n]
             \ 
              \
               \               CLUSTER_RELAZIONA[1..m]
                |-> Ateco <-------------------------------> Sll
               /
              /
             /
            /  CLUSTER_CONTIENE[1..n]
Exporting<-/
```

Ogni relazione è navigabile in etrambe le direzioni, in tal modo è possibile ottenere da un `Cluster` tutti gli `Sll` che lo contengono, ma 
anche ottenere da un `Sll` tutti i `Cluster` a cui partecipa.
