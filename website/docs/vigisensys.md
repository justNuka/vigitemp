Pour la licence One: 

Travail par offset manuel (pour client sans intérêt de métrologie) offset saisie manuellement par l'utilisateur dans la fiche sonde 

Utilisation d'un fichier de ajustage coefficient a et B présent dans t_calibrage 

Utilisation d'un fichier d'étalonnage mono point utilisation de l'erreur de justesse uniquement blocage de l'offset à "0" 

écran Dashboard simplifié la barre des taches passe en mode bouton  


Pour la licence Standard: 

écran avec tuile fixe 

Messagerie interne entre utilisateur pour centraliser la hotline (les utilisateurs peuvent par exemple remonter un problème a un admin, qui lui va s'occuper de ca) -> afficher le profil au dessus des users, avatars 

Travail par offset manuel (pour client sans intérêt de métrologie)offset saisie manuellement par l'utilisateur dans la fiche sonde 

Utilisation d'un fichier d'ajustage coefficient a et B présent dans t_calibrage 

Utilisation d'un fichier d'étalonnage mono point utilisation de l'erreur de justesse uniquement blocage de l'offset à "0" 

Gestion de la dérive la dérive ce calcul avec la différence entre les erreurs de justesses des différents étalonnage, il faut que le client puisse avoir la courbe de la dérive et qu'il puisse définir un valeur max dans la fiche sonde lorsque cette valeur max est dépassée, il y a une information sur le dashboard de métrologie, si la dérive est à "0" dans la fiche sonde on considère que l'utilisateur d'utilise pas l'alerte de dérive max donc pas d'information 

Utilisation d'un fichier d'étalonnage multi point (sans courbe de correction car spécifique étalon) n le met dans le mode expert 

Module d' ajustage module permettant à l'utilisateur de redéfinir les coefficients de calibrage a et b, dans ce cas lors du calibrage, les valeurs du précédent calibrage s'il existe ne doivent pas être pris en compte, l'offset non plus 

Module d'étalonnage module permettant de définir l'erreur de justesse et l'incertitude, dans ce cas les coefficients de calibrage ou d'offset doivent étre pris en compte. 

Lecture de l'étalon la lecture de l'étalon n'est pas possible s'il n'existe pas de certificat d'étalonnage, s'il est présent,  3 coefficients sont utilisées sous forme y=alphax2+bétax+gamma, ces coefficients sont fourni par MC2 lors de l'étalonnage. Le certificat peut etre renseigné pour l'hitorique (a voir ) 

Paramétrage des EMT du lieux (idem vigitemp 10)
