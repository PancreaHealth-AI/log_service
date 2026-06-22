Ce projet est un microservice de gestion des journaux (Logs) et d'audit, faisant partie de l'écosystème PancreaHealth-AI. Son rôle principal est de centraliser, stocker et analyser tous les événements importants se produisant dans les autres microservices du système.

Voici les points clés de ce que fait ce projet :

1. Centralisation des Logs (Audit)
Le service agit comme un "cerveau" pour la traçabilité. Il récupère des événements provenant de différentes sources :

Authentification (auth.events) : Connexions, déconnexions, erreurs de mot de passe.
Médical (medical.events) : Consultations de dossiers, modifications de données de santé.
Accès (access.events) : Qui a accédé à quelle ressource et quand.
Système (system.events) : Erreurs critiques ou changements de configuration.
2. Stack Technologique Moderne
NestJS : Le framework Node.js utilisé pour construire le service.
Kafka : Utilisé pour recevoir les messages de manière asynchrone (via des EventPattern). Cela permet au système de ne pas ralentir les autres services lors de l'enregistrement des logs.
Elasticsearch : Le moteur de stockage et de recherche. Il permet de stocker des volumes massifs de logs et de faire des recherches ultra-rapides (par utilisateur, par action, par date, etc.).
3. Fonctionnalités Principales
Audit Service : Enregistre chaque action avec des détails comme la sévérité (INFO, WARNING, CRITICAL), le statut (SUCCESS, FAILURE) et l'ID de l'utilisateur.
Recherche & Filtrage : Fournit une API pour filtrer les logs (ex: "Montre-moi tous les accès ratés de l'utilisateur X sur les dossiers médicaux").
Alertes de Sécurité : Détecte probablement des comportements suspects basés sur les logs reçus.
Statistiques : Analyse les logs pour générer des rapports sur l'utilisation du système.
Accès d'Urgence : Un module spécifique semble gérer et tracer les accès en mode "urgence" aux données sensibles.
Structure du Code
src/modules/audit : Logique de création et recherche de logs.
src/modules/kafka-consumer : Écoute les messages Kafka envoyés par les autres services.
src/infrastructure/elasticsearch : Configuration de la base de données de recherche.
En résumé, c'est la boîte noire du système qui assure la conformité, la sécurité et la traçabilité de tout ce qui se passe sur la plateforme.



Viewed logs-service-description.md:10-26
Edited logs-service-description.md
Viewed create-audit-log.dto.ts:1-55
Viewed kafka-consumer.service.ts:1-51
Listed directory security-alerts
Viewed security-alerts.service.ts:1-35
Viewed audit.controller.ts:1-38
Listed directory emergency-access
Viewed emergency-access.controller.ts:1-27
Viewed emergency-access.service.ts:1-34
Viewed audit-action.enum.ts:1-13
Viewed severity.enum.ts:1-7
Searched for "security_alerts"
Viewed audit-logging.interceptor.ts:1-116

Pour tester ton microservice, voici des exemples de structures (Body) pour Kafka et Swagger. 

Le système fait la distinction entre **Audit**, **Security** et **Emergency** principalement grâce aux champs `action` et `severity`.

---

### 1. Exemples de Body pour Swagger (`POST /audit/logs`)

#### A. Log d'Audit Standard (Action classique)
*C'est une trace d'activité normale.*
```json
{
  "user_id": "user_123",
  "action": "VIEW_MEDICAL_RECORD",
  "resource": "patient_789",
  "service_name": "medical-service",
  "severity": "INFO",
  "status": "SUCCESS",
  "metadata": {
    "module": "Cardiology",
    "details": "User viewed the last ECG report"
  }
}
```

#### B. Log de Sécurité (Alerte potentielle)
*Identifié par une sévérité élevée (`CRITICAL` ou `ERROR`) ou une action suspecte.*
```json
{
  "user_id": "anonymous_ip",
  "action": "FAILED_LOGIN_ATTEMPT",
  "resource": "auth_system",
  "service_name": "auth-service",
  "severity": "CRITICAL",
  "status": "FAILED",
  "ip_address": "192.168.1.50",
  "metadata": {
    "reason": "Brute force detected",
    "attempts": 10
  }
}
```

#### C. Log d'Accès d'Urgence (Emergency)
*Identifié spécifiquement par l'action `EMERGENCY_ACCESS`. Ce log apparaîtra dans la section "Emergency Access" pour validation.*
```json
{
  "user_id": "doctor_456",
  "action": "EMERGENCY_ACCESS",
  "resource": "patient_critical_789",
  "service_name": "medical-service",
  "severity": "WARNING",
  "status": "PENDING",
  "metadata": {
    "justification": "Cardiac arrest, immediate access needed to history",
    "patient_status": "Unconscious"
  }
}
```

---

### 2. Exemples pour Kafka (Topics `auth.events`, `medical.events`, etc.)

Le service `KafkaConsumerService` mappe automatiquement ces données. Le format attendu dans le message Kafka est :

```json
{
  "userId": "user_777",
  "action": "UPDATE_PRESCRIPTION",
  "resource": "prescription_001",
  "ip_address": "10.0.0.5",
  "user_agent": "Mozilla/5.0...",
  "service_name": "pharmacy-service",
  "severity": "INFO",
  "metadata": {
    "old_value": "Doliprane 500mg",
    "new_value": "Doliprane 1000mg"
  }
}
```

---

### 3. Comment le service sait-il de quoi il s'agit ?

Le système utilise des filtres sur l'index Elasticsearch `audit_logs` :

| Type | Critère de distinction | Exemple d'utilisation |
| :--- | :--- | :--- |
| **Audit** | Par défaut, tout log est un log d'audit. | Consultation de routine, modification mineure. |
| **Security** | Filtré sur `severity: "CRITICAL"` ou `severity: "ERROR"`. | Tentative d'intrusion, suppression de base de données. |
| **Emergency** | Filtré strictement sur `action: "EMERGENCY_ACCESS"`. | Accès exceptionnel "Break the glass" par un médecin. |

**Où cela se passe-t-il dans le code ?**
- Pour l'**Emergency** : Voir `src/modules/emergency-access/emergency-access.service.ts` qui cherche spécifiquement `action: 'EMERGENCY_ACCESS'`.
- Pour l'**Audit** : C'est le flux général dans `src/modules/audit/audit.service.ts`.
- Pour la **Sécurité** : Le module `security-alerts` surveille les logs à haute sévérité pour créer des alertes à investiguer.


Edited logs-service-description.md
Viewed logs-service-description.md:111-135

Pour intégrer ce service de logs dans tes autres microservices (ex: Auth, Medical, etc.), tu as deux approches principales.

### 1. Intégration via Kafka (Recommandée pour la performance)

C'est l'approche la plus "propre" car elle ne ralentit pas le service qui émet le log (asynchrone).

**Dans l'autre service (ex: Auth Service) :**
1.  Configure un **Kafka Producer**.
2.  Envoie un message sur le topic correspondant (`auth.events`, `system.events`, etc.) dès qu'un événement survient.

```typescript
// Exemple dans un service d'authentification
async login(user) {
  // ... logique de login ...
  
  // Émettre le log de succès vers Kafka
  this.kafkaClient.emit('auth.events', {
    userId: user.id,
    action: 'LOGIN_SUCCESS',
    resource: 'auth_module',
    severity: 'INFO',
    metadata: { method: 'JWT' }
  });
}
```

---

### 2. Ajout des logs de Système (Erreurs, Crashs, DB)

Oui, il est crucial d'ajouter ces logs. Voici comment capturer les erreurs "système" comme une base de données qui échoue ou un crash de service.

#### A. Capturer les erreurs de Base de Données
Tu peux utiliser un **Exception Filter** global dans ton service client pour capturer toutes les erreurs non gérées et les envoyer au topic `system.events`.

```typescript
// Dans le service qui risque de crash (ex: Medical Service)
@Catch()
export class GlobalErrorFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const isDatabaseError = exception.message.includes('QueryFailedError') || exception.message.includes('ECONNREFUSED');
    
    this.kafkaClient.emit('system.events', {
      action: isDatabaseError ? 'DATABASE_FAILURE' : 'SYSTEM_CRASH',
      resource: 'database_connection',
      severity: 'CRITICAL', // Très important pour les alertes de sécurité
      metadata: { 
        error: exception.message,
        stack: exception.stack,
        service: 'medical-service'
      }
    });
  }
}
```

#### B. Capturer le crash d'un service (Health Check)
Si un service crash complètement, il ne peut plus envoyer de logs lui-même. Pour cela :
1.  **Le Log Service** (ou un orchestrateur comme Kubernetes) peut surveiller le "Health Check" des services.
2.  Si un service ne répond plus, le **Log Service** génère lui-même un log de type :
```json
{
  "action": "SERVICE_UNAVAILABLE",
  "resource": "auth-service",
  "severity": "CRITICAL",
  "metadata": { "status": "DOWN", "reason": "Health check failed" }
}
```

---

### Résumé de l'intégration pour les logs système :

| Scénario | Moyen d'intégration | Topic Kafka | Sévérité |
| :--- | :--- | :--- | :--- |
| **Erreur SQL / DB** | Exception Filter (NestJS) | `system.events` | `CRITICAL` |
| **Erreur 500 API** | Interceptor | `system.events` | `ERROR` |
| **Crash Service** | Watcher / Health Check | `system.events` | `CRITICAL` |
| **Tentative Intrusion** | Auth Guard / Middleware | `auth.events` | `WARNING` |

**Comment le service de logs réagit ?**
Dès qu'il reçoit un message sur `system.events` avec une `severity: "CRITICAL"`, il peut :
1.  L'enregistrer dans Elasticsearch.
2.  Déclencher une **Alerte de Sécurité** immédiate (visible dans ton module `security-alerts`).
3.  (Optionnel) Envoyer un email ou une notification à l'administrateur.

Edited logs-service-description.md
Viewed logs-service-description.md:188-206
Viewed kafka.config.ts:1-17
Viewed elasticsearch.config.ts:1-13

Voici les détails des événements Kafka et des index Elasticsearch utilisés dans le projet :

### 1. Événements Kafka (Topics)
Le microservice écoute (consume) les topics suivants pour centraliser les informations :

| Topic | Description | Type d'événements |
| :--- | :--- | :--- |
| **`auth.events`** | Authentification | Login, Logout, MFA, Changement de mot de passe. |
| **`medical.events`** | Activité Médicale | Consultation de dossier, Ajout d'ordonnance, Modification de données. |
| **`access.events`** | Contrôle d'Accès | Permission refusée, Accès à des fichiers sensibles. |
| **`system.events`** | Santé du Système | Erreurs DB, Crash de service, Latence élevée, Défaillance technique. |

---

### 2. Index Elasticsearch
Les logs sont organisés dans Elasticsearch pour faciliter la recherche et le monitoring :

| Index | Contenu | Rôle |
| :--- | :--- | :--- |
| **`audit_logs`** | Logs d'audit métier | Stocke l'historique de qui a fait quoi (Actions, Emergency Access). |
| **`technical_logs`** | Logs techniques | Détails sur les erreurs serveurs, les temps de réponse et les stacks d'erreurs. |
| **`security_alerts`** | Alertes de sécurité | Événements critiques demandant une intervention humaine (Investigation). |

---

### Résumé Technique (Config)

*   **Kafka Client ID** : `audit-log-service`
*   **Kafka Group ID** : `audit-consumer-group`
*   **Elasticsearch Node** : `http://klodit.app:9200` (par défaut)

**Note sur l'Emergency Access :** Actuellement, les accès d'urgence sont stockés directement dans l'index `audit_logs` avec l'action `EMERGENCY_ACCESS`, ce qui permet de les retrouver facilement sans multiplier les index.