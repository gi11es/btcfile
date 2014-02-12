if (window.i18n === undefined) {

window.i18n = {
	 menu: {
		 api: 'API'
		,feedback: 'feedback &amp; support'
		,sell: 'sell content'
		,what: 'what is btcfile?'
		,bitcoin: 'what is bitcoin?' 	
	}
	,sizes: {
		 b: 'B'
		,kb: 'KB'
		,mb: 'MB'
		,gb: 'GB'
		,tb: 'TB'
	}
	,start: {
		 title: 'btcfile: sell digital content for bitcoins'
		,slogan: 'sell digital content for bitcoins'
		,instructions: 'drag &amp; drop the file(s) you wish to sell to this window'
		,legacy_upload: 'Upload files...'
		,promo: '★ No fees! Earn 100% of what buyers pay for your content'
		,stats1: 'files for sale totalling'
		,stats2: 'of content'
		,stats3: 'BTC have exchanged hands'
	}
	,settings: {
		 title: 'btcfile: update content settings'
		,instructions: 'share this link to sell your content'
		,price: 'price'
		,price_explanation: 'This is the total price the buyer will pay to acquire this content. The minimum price is the equivalent of 10000 satoshis at current exchange rates.'
		,address: 'bitcoin address'
		,address_explanation: 'This is the bitcoin address that will be credited. It is not exposed to the buyers.'
		,address_tip1: 'don\'t have a bitcoin address yet?'
		,address_tip2: 'create a wallet'
		,address_tip3: 'on blockchain.info'
		,update_tip1: 'remember to bookmark this page if you want to update or'
		,update_tip2: 'delete'
		,update_tip3: 'this content later'
		,delete_confirm: 'Are you sure you want to delete this content? This cannot be undone.'
	}
	,download: {
		 title: 'btcfile: download'
		,instructions1: 'to buy this content, send'
		,instructions2: 'BTC to this address'
		,payment: 'you must keep this window open, your download will start automatically when you send the payment'
		,exit: 'If you\'ve paid, you must leave this window open for the download to start.'
		,confirmed: 'your payment has been confirmed, your download will start shortly!'
		,partial1: 'your partial payment has been confirmed, you still need to send'
		,partial2: 'BTC before the download starts'
	}
	,api: {
		 title: 'btcfile: API'
		,simple: 'a dead-simple API to buy and sell digital content'
		,json: 'Our endpoints expect HTTP POST requests and return JSON'
		,sell: 'lets you upload one or more files and set the price. The files provided in the first POST request to the endpoint always stay the same. Once uploaded, the files cannot be updated. The price can be updated at any time.'
		,buy: 'lets you obtain the content\'s informations and gives you an address where the bitcoin payment needs to be sent. It lets you track that the payment has gone through. When it has, it returns a disposable download URL to access the paid content.'
		,btcfile: 'btcfile.com itself is a lightweight client using this public API. Just inspect the site with your browser\'s developer tools, watch the network tab and see how the API is used.'
		,samples: 'code samples'
		,samples_foreword: 'These straightforward samples demonstrate both endpoints and all the options available in the API'
	}
	,what_is_it: {
		 title: 'btcfile: what is it?'
		,what: 'what is btcfile?'
		,easy: 'We provide the easiest way to buy and sell digital content online. Our service is meant to be the simplest and the most straightforward possible.'
		,how_much: 'how much does it cost?'
		,free: 'Our service is entirely <b>FREE</b>. Content producers earn <b>100%</b> of the bitcoins paid by buyers. No hidden fees, no trick.'
		,content: 'what kind of content?'
		,anything: 'Anything that can be transmitted as a file can be sold on btcfile. Videos, music, images, books, video games, software... anything\'s possible.'
		,sell: 'how much can I sell content for?'
		,minimum: 'The minimum price is 10,000 satoshis or the equivalent in the currency you decide to use. No maximum price. Buyers are actually free to pay you more than the set price if they want to, you will receive all the proceeds, including the excess payment. You can for example set a very low price and encourage buyers to pay what they want.'
		,currencies: 'which currencies are supported?'
		,exchange_rates1: 'Our bitcoin exchange rates are the average over the past 24 hours, fetched every 15 minutes from'
		,exchange_rates2: 'When you set a price in a currency other than bitcoin, we adjust the bitcoin price at the time the buyer want to purchase your content. You can set prices in BTC, mBTC, AUD, BRL, CAD, CHF, CNY, EUR, GBP, ILS, JPY, PLN, RUB, SEK, SGD, SLL, USD, XRP.'
		,how: 'how?'
		,no_registration: 'No registration is needed.'
		,buyers: 'Buyers'
		,buyers_explanations: 'just send bitcoins to the address we provide and your download will start.'
		,producers: 'Content producers'
		,producers_explanations: 'just upload one or more files, set a price and bitcoin address. We send the bitcoins you have earned to your address(es) once a day.'
		,developers: 'Developers'
		,developers_explanations1: 'integrating'
		,developers_explanations2: 'with us takes 5 minutes. You have total freedom, you can redirect to btcfile.com for some steps or you can do everything through the API without ever showing btcfile.com to your users.' 
	}
	,old_browser: {
		 message: 'your web browser is incompatible'
		,explanations: 'btcfile requires support for fairly modern javascript functionalities, which your web browser doesn\'t provide. If you want to use our service, we recommend that you install the latest available version of a popular web browser such as Google Chrome.'
	}
};

}