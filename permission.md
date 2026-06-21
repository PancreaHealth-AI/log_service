Edited audit.controller.ts
Edited audit.controller.ts
Edited audit.controller.ts
Edited emergency-access.controller.ts
Edited reports.controller.ts
Edited security-alerts.controller.ts
Viewed statistics.controller.ts:1-21
Edited statistics.controller.ts
Edited permissions-matrix.md

Voici la liste des permissions actuellement configurées dans le service (mises à jour suite à vos modifications) avec une brève description pour chacune :

### 1. Gestion des logs (`AuditController` & `StatisticsController`)
* **`log_audit.read`** : Permet de consulter et rechercher les listes de logs (qu'ils soient d'audit, de sécurité ou techniques).
* **`log_details.read`** : Permet de consulter les détails complets d'un log spécifique via son identifiant (ID).
* **`log_statistics.read`** : Permet d'accéder aux statistiques d'activité globale du système.

### 2. Rapports & Exports (`ReportsController`)
* **`log_audit_generate.export`** : Permet de générer un rapport d'activité basé sur les logs.
* **`log_audit.export`** : Permet d'exporter les données personnelles de logs (pour conformité RGPD).

### 3. Alertes de sécurité (`SecurityAlertsController`)
* **`log_security.read`** : Permet de lister et consulter toutes les alertes de sécurité actives.
* **`log_security_investigate.excute`** : Permet de passer une alerte de sécurité en cours d'investigation.
* **`log_security_resolve.excute`** : Permet de clore et marquer une alerte de sécurité comme résolue.

### 4. Accès d'urgence (`EmergencyAccessController`)
* **`emergency_access.read`** : Permet de lister les demandes d'accès d'urgence (mode "Break-Glass") en attente de revue.
* **`emergency_access.review`** : Permet de valider ou rejeter une demande d'accès d'urgence.