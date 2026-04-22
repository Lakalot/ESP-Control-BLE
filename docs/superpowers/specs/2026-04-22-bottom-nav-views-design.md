# Bottom Nav Views Design

## Goal

Ajouter au manifeste un systeme de vues applicatives avec une barre de navigation inferieure optionnelle, afin de permettre la creation d'interfaces plus riches depuis l'ESP sans complexifier inutilement l'ecriture des manifests.

## Scope

Cette evolution couvre :
- une structure declarative de vues applicatives pour le manifeste
- une barre de navigation inferieure optionnelle et globale
- la validation du schema et des references entre navigation et vues
- le rendu mobile permettant de changer de vue via la barre du bas
- la documentation README pour expliquer l'authoring et les noms d'icones

Cette evolution ne couvre pas :
- un systeme de routing mobile complexe ou imbrique
- des sous-vues locales a un screen parent
- des animations de navigation avancees
- des icones inline, SVG embarques, ou packs d'icones multiples

## Product Direction

La navigation doit permettre a un auteur de manifeste de declarer une application complete avec des vues comme `home`, `settings` ou `stats`, tout en gardant un mode simple sans barre de navigation pour les manifests minimalistes.

L'authoring doit rester logique : on declare des vues, on declare eventuellement une `navBar`, puis chaque item de navigation pointe vers une vue existante. Le manifeste ne doit pas obliger a dupliquer la structure de contenu ni a introduire une notion parallele difficile a comprendre.

## Manifest Model

### Views

Le manifeste expose une notion de vue applicative comme surface de contenu navigable.

Chaque vue contient :
- `id`
- `title`
- `rootNodeId`

Chaque vue continue de s'appuyer sur l'arbre `nodes` existant. Le contenu d'une vue est donc toujours decrit via le `rootNodeId` et les widgets/conteneurs deja supportes.

### App Shell

Le manifeste peut optionnellement declarer un `appShell` global.

`appShell` peut contenir une `navBar` globale fixe en bas de l'ecran. Si `appShell` ou `appShell.navBar` sont absents, l'application rend simplement la vue initiale sans barre de navigation.

### Bottom Nav Bar

`appShell.navBar.items` decrit les boutons de navigation inferieure.

Chaque item contient :
- `id`
- `label`
- `icon`
- `viewId`

Contraintes :
- minimum `1` item si `navBar` est presente
- maximum `5` items
- ids d'items uniques
- chaque `viewId` doit referencer une vue existante

Le champ `icon` est une chaine libre correspondant au nom d'icone de la librairie mobile retenue. Le schema ne maintient pas de liste fermee.

## Initial View Resolution

Le choix de la vue initiale suit une regle implicite simple :

- si `navBar` existe, la vue initiale est celle du premier item
- sinon, la vue initiale est la premiere vue declaree dans le manifeste

Cette regle evite d'ajouter un champ obligatoire supplementaire tout en gardant un comportement deterministe.

## Authoring Example

Exemple cible :

```json
{
  "appShell": {
    "navBar": {
      "items": [
        { "id": "home", "label": "Home", "icon": "home", "viewId": "home" },
        { "id": "stats", "label": "Stats", "icon": "bar-chart-2", "viewId": "stats" },
        { "id": "settings", "label": "Settings", "icon": "settings", "viewId": "settings" }
      ]
    }
  },
  "views": [
    { "id": "home", "title": "Home", "rootNodeId": "home.root" },
    { "id": "stats", "title": "Stats", "rootNodeId": "stats.root" },
    { "id": "settings", "title": "Settings", "rootNodeId": "settings.root" }
  ]
}
```

Cet exemple illustre le modele produit. L'implementation peut conserver temporairement des noms internes historiques comme `screens` si cela reduit la rupture technique, mais l'interface d'authoring doit presenter clairement le concept de `views`.

## Runtime And Rendering

Le rendu mobile s'organise autour d'un shell principal du manifeste :
- une zone de contenu qui affiche la vue active
- une barre inferieure fixe si `navBar` est declaree

Le shell conserve un etat `activeViewId` local.

Comportement :
- la vue active est initialisee selon la regle de resolution ci-dessus
- un appui sur un item de la barre change `activeViewId`
- seule la zone de contenu change, la coque visuelle reste stable
- le contenu de chaque vue continue d'utiliser le renderer de nodes existant

L'objectif est d'ajouter une navigation applicative sans introduire de sous-systeme de routing lourd ni casser le modele de rendu V5 actuel.

## Error Handling And Fallbacks

Comportements attendus :
- si aucune vue n'est declaree, afficher une erreur explicite
- si un item de `navBar` reference une vue inconnue, le manifeste est invalide cote compilation/validation
- si le nom d'icone n'existe pas dans la librairie mobile, utiliser une icone fallback standard cote app
- si plus de `5` items sont declares, retourner une erreur de validation
- si `navBar` est absente, rendre normalement la vue initiale sans reserve d'espace pour la barre

## Documentation

Le README doit etre etendu pour couvrir :
- la notion de vues applicatives
- le caractere optionnel de `appShell.navBar`
- un exemple minimal sans `navBar`
- un exemple avec `navBar`
- une liste des noms d'icones les plus frequents
- un lien vers la documentation officielle de la librairie d'icones utilisee par l'application mobile

La documentation doit insister sur le fait que les noms d'icones doivent correspondre exactement a ceux attendus par la librairie mobile.

## Testing

Les tests doivent couvrir au minimum :
- validation d'un manifeste avec vues et sans `navBar`
- validation d'un manifeste avec `navBar` correcte
- erreur si `navBar.items` contient plus de `5` elements
- erreur si un item reference une vue inexistante
- rendu mobile de la vue initiale avec `navBar`
- changement de vue lors du tap sur un item
- rendu mobile sans `navBar`
- fallback d'icone inconnue

## Success Criteria

L'evolution est consideree reussie si :
- un manifeste peut decrire plusieurs vues applicatives de facon lisible
- la barre inferieure est entierement optionnelle
- une `navBar` peut changer de vue entre `1` et `5` destinations
- l'auteur peut choisir librement un nom d'icone compatible avec la librairie mobile
- l'application mobile reste capable de rendre une app mono-vue sans navigation
- la documentation explique clairement la structure et les noms d'icones les plus utiles
