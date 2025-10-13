# Hooks de Synchronisation des Données

Ce dossier contient des hooks personnalisés pour synchroniser les données entre les onglets de l'application.

## useDataSync

Hook générique pour synchroniser n'importe quel type de données entre les onglets.

### Fonctionnalités

- **Synchronisation automatique** : Les données se mettent à jour automatiquement quand elles changent dans un autre onglet
- **Cache localStorage** : Les données sont mises en cache pour améliorer les performances
- **Événements personnalisés** : Utilise les événements du navigateur pour la communication entre onglets
- **Gestion d'erreurs** : Gestion robuste des erreurs de chargement
- **Rechargement manuel** : Possibilité de forcer le rechargement des données

### Utilisation

```javascript
import { useDataSync } from './useDataSync';

const MyComponent = () => {
  const { data, loading, error, refresh, notifyUpdate } = useDataSync(
    'myDataType',     // Type de données (pour le cache)
    fetchFunction,     // Fonction pour récupérer les données
    [dependency]       // Dépendances pour le rechargement
  );

  return (
    <div>
      {loading && <p>Chargement...</p>}
      {error && <p>Erreur: {error}</p>}
      {data.map(item => <div key={item.id}>{item.name}</div>)}
      <button onClick={refresh}>Actualiser</button>
    </div>
  );
};
```

## Hooks spécialisés

### useMarchesSync
Synchronise les marchés entre les onglets.

```javascript
import { useMarchesSync } from './useDataSync';

const { data: marches, loading, error, refresh } = useMarchesSync();
```

### useTypesSync
Synchronise les types de matériel.

```javascript
import { useTypesSync } from './useDataSync';

const { data: types, loading, error, refresh } = useTypesSync();
```

### useMarquesSync
Synchronise les marques selon le type sélectionné.

```javascript
import { useMarquesSync } from './useDataSync';

const { data: marques, loading, error, refresh } = useMarquesSync(selectedTypeId);
```

### useModelesSync
Synchronise les modèles selon la marque et le type sélectionnés.

```javascript
import { useModelesSync } from './useDataSync';

const { data: modeles, loading, error, refresh } = useModelesSync(selectedMarqueId, selectedTypeId);
```

## Comment ça marche

1. **Cache localStorage** : Chaque type de données est mis en cache avec un timestamp
2. **Événements storage** : Les changements de localStorage déclenchent la synchronisation
3. **Événements personnalisés** : Pour la synchronisation dans le même onglet
4. **Mise à jour automatique** : Les composants se mettent à jour automatiquement

## Intégration

Pour intégrer la synchronisation dans un composant existant :

1. Remplacer les `useState` et `useEffect` par les hooks de synchronisation
2. Supprimer les appels API manuels
3. Utiliser les données et états fournis par les hooks

## Exemple complet

```javascript
// Avant
const [marches, setMarches] = useState([]);
const [loading, setLoading] = useState(false);

useEffect(() => {
  getMarches()
    .then(res => setMarches(res.data))
    .catch(() => setMarches([]));
}, []);

// Après
const { data: marches, loading, error } = useMarchesSync();
```

## Notes importantes

- Les données sont mises en cache dans `localStorage`
- La synchronisation fonctionne uniquement entre onglets du même domaine
- Les erreurs sont gérées automatiquement et affichées dans le composant
- Le rechargement manuel est disponible via la fonction `refresh`
