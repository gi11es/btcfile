if (window.i18n === undefined && utils.language().slice(0, 2) == 'fr') {

window.i18n = {
	 menu: {
		 api: 'API'
		,feedback: 'avis &amp; support'
		,sell: 'vendre du contenu'
		,what: 'btcfile, c\'est quoi?'
		,bitcoin: 'bitcoin, c\'est quoi?' 	
	}
	,sizes: {
		 b: 'o'
		,kb: 'ko'
		,mb: 'Mo'
		,gb: 'Go'
		,tb: 'To'
	}
	,start: {
		 title: 'btcfile: vendez du contenu numérique pour des bitcoins'
		,slogan: 'vendez du contenu numérique pour des bitcoins'
		,instructions: 'glissez-déposez sur cette fenêtre le ou les fichiers que vous souhaitez vendre'
		,legacy_upload: 'Charger des fichiers...'
		,promo: '★ Aucun frais! Gagnez 100% de ce que les acheteurs payent'
		,stats1: 'fichiers à vendre totalisant'
		,stats2: 'de contenu'
		,stats3: 'BTC ont changé de mains'
	}
	,settings: {
		 title: 'btcfile: mettre à jour les paramètres de votre contenu'
		,instructions: 'partagez ce lien pour vendre votre contenu'
		,price: 'prix'
		,price_explanation: 'Ceci est le prix total que l\'acheteur devra payer pour acquérir ce contenu. Le prix minimum est l\'équivalent de 10000 satoshis au taux de change courant.'
		,address: 'adresse bitcoin'
		,address_explanation: 'Ceci est l\'adresse qui sera créditée. Elle n\'est pas montrée aux acheteurs.'
		,address_tip1: 'vous n\'avez pas encore d\'adresse bitcoin?'
		,address_tip2: 'créez un portefeuille'
		,address_tip3: 'sur blockchain.info'
		,update_tip1: 'pensez à ajouter cette pages à vos signets si vous souhaiter mettre à jour les paramètres de ce contenu ou le'
		,update_tip2: 'supprimer'
		,update_tip3: 'plus tard'
		,delete_confirm: 'Êtes-vous sûr(e) de vouloir supprimer ce contenu? Cette action ne peut pas être annulée.'
	}
	,download: {
		 title: 'btcfile: télécharger'
		,instructions1: 'pour acheter ce contenu, envoyez'
		,instructions2: 'BTC à cette adresse'
		,payment: 'vous devez garder cette fenêtre ouverte, votre téléchargement démarrera automatiquement quand vous enverrez le paiement'
		,exit: 'Si vous avez déjà payé, vous devez garder cette fenêtre ouverte afin de pouvoir télécharger votre contenu.'
		,confirmed: 'votre paiement a été confirmé, votre téléchargement va démarrer sous peu!'
		,partial1: 'votre paiement partiel a été confirmé, vous devez encore envoyer'
		,partial2: 'BTC avant que votre téléchargement commence'
	}
	,api: {
		 title: 'btcfile: API'
		,simple: 'une API ultra simple pour acheter et vendre du contenu numérique'
		,json: 'Nos points d\'accès attendent des requêtes HTTP POST et renvoient des réponses JSON'
		,sell: 'vous permet de charger un ou plusieurs fichiers et de définir le prix. Les fichiers fournis dans votre première requête POST au points d\'accès ne changent plus jamais. Une fois chargés, les fichiers ne peuvent pas être modifiés. Le prix peut être changé à tout moment.'
		,buy: 'vous permet d\'obtenir les informations sur le contenu et vous donne une adresse vers laquelle le paiement bitcoin doit être envoyé. Il vous permet de suivre si le paiement a bien été effectué. Quand le paiement a bien eu lieu, il vous donne une URL à usage unique pour accédé au contenu payé.'
		,btcfile: 'le site btcfile.com est lui-même un client léger de cette API publique. Inspéctez simplement le site avec les outils de développement de votre navigateur et vous verrez comment l\'API est utilisée en observant l\'onglet d\'activité réseau.'
		,samples: 'exemples de code'
		,samples_foreword: 'Ces exemples simples montrent le fonctionnement de nos deux points d\'accès ainsi que toutes les options disponibles dans l\'API'
	}
	,what_is_it: {
		 title: 'btcfile: c\'est quoi?'
		,what: 'btcfile, qu\'est-ce que c\'est?'
		,easy: 'Notre service est la façon la plus facile de vendre et acheter du contenu numérique en ligne. Notre service est conçu pour être le plus simple et le plus direct possible.'
		,how_much: 'combien ça coûte?'
		,free: 'Notre service est totalement <b>GRATUIT</b>. Les créateurs de contenu gagnent <b>100%</b> des bitcoins que les acheteurs payent. Pas de frais cachés, pas d\'astuce.'
		,content: 'quel type de contenu?'
		,anything: 'Tout ce qui peut être transmis sous forme de fichier peut être vendu sur btcfile. Vidéos, musique, images, livres, jeux vidéos, logiciels... tout est possible.'
		,sell: 'à quel prix peut-on vendre le contenu?'
		,minimum: 'Le prix minimum est de 10000 satoshis ou l\'équivalent dans la monnaie de votre choix. Pas de prix maximum. Les acheteurs sont libres de payer plus que le prix affiché si ils le souhaitent, vous recevrez la totalité de ce qu\'ils ont donné, y compris le paiement en excès. Vous pouvez par exemple définir un prix très bas en encourager les acheteurs à payer ce qu\'ils souhaitent.'
		,currencies: 'quelles monnaies sont possibles?'
		,exchange_rates1: 'Nos taux de change bitcoin sont la moyenne sur les dernières 24 heures, récupérés toutes les 15 minutes sur'
		,exchange_rates2: 'Quand vous définissez un prix dans une monnaie autre que bitcoin, nos ajustons le prix en bitcoin au moment où l\'acheteur consulte votre contenu pour l\'acheter. Vous pouvez définir les prix en BTC, mBTC, AUD, BRL, CAD, CHF, CNY, EUR, GBP, ILS, JPY, PLN, RUB, SEK, SGD, SLL, USD, XRP.'
		,how: 'comment?'
		,no_registration: 'Aucune inscription n\'est nécessaire.'
		,buyers: 'Acheteurs'
		,buyers_explanations: 'envoyer des bitcoins à une adresse que nous fournissons et votre téléchargement démarrera.'
		,producers: 'Créateurs de contenu'
		,producers_explanations: 'chargez simplement un ou plusieurs fichiers, définisser un prix et une adresse bitcoin. Nous vous envoyons une fois par jour les bitcoins que vous avez gagné.'
		,developers: 'Développeurs'
		,developers_explanations1: 's\'intégrer'
		,developers_explanations2: 'à notre service prend 5 minutes. Vous avez une liberté totale, vous pouvez rediriger vers btcfile.com pour certaines étapes ou vous pouvez tout faire par l\'API sans jamais montrer btcfile.com à vos utilisateurs.' 
	}
	,old_browser: {
		 message: 'votre navigateur est incompatible'
		,explanations: 'btcfile nécessite des fonctionnalités javascript modernes, que votre navigateur ne possède pas. Si vous souhaitez utiliser notre service, nous vous recommendons d\'installer la version la plus récente d\'un navigateur populaire, tel que Google Chrome.'
	}
};

}