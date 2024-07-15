const axios = require('axios').default;
/*
Soporte API Facturama
	soporte-api@facturama.mx
*/



const valuesFacturama = {
	token: process.env.FACTURAMA_TOKEN,
	url: process.env.NODE_ENV === "production" ? "https://api.facturama.mx/" : "https://apisandbox.facturama.mx/"
};
const instance = axios.create({
	baseURL: valuesFacturama.url,
});

instance.defaults.headers.common["Authorization"] = "Basic " + valuesFacturama.token;

const facturama = () => {

	const retrieve = (path, id) => {
		return instance.get(path + '/' + id).then(response => response.data);
	};

	const list = (path) => {
		return instance.get(path).then(response => response.data);
	};

	const listWithParam = (path, param) => {
		return instance.get(path + param).then(response => response.data);
	};

	const postSyncWithParam = (path, param) => {
		return instance.post(path + param).then(response => response.data);
	};

	const postSyncWithData = (path, data) => {
		return instance.post(path, data, {
			headers: {
				'Content-Type': 'application/json',
			}
		}).then(response => response.data).catch(e => {
			console.log("ERROR FACTURAMA LIB:", e.response.data);
			throw e.response.data;

		})
			;
	};

	const putSyncWithData = (path, data) => {
		return instance.put(path, data, {
			headers: {
				'Content-Type': 'application/json',
			}
		}).then(response => response.data);
	};

	const deleteSyncWithParam = (path, param) => {
		return instance.delete(path + '/' + param).then(response => response.data);
	};

	const facturamaObject = {
		Cfdi: {
			Get: (id) => retrieve('api-lite/cfdis', id),
			GetPdf: (id) => retrieve('cfdi/pdf/issuedLite', id),
			GetXml: (id) => retrieve('cfdi/xml/issuedLite', id),
			List: (param) => listWithParam('api-lite/cfdis', param),
			Create: (data) => postSyncWithData('api-lite/3/cfdis', data),
			Send: (param) => postSyncWithParam('cfdi', param),
			Cancel: (params) => deleteSyncWithParam('api-lite/cfdis', params),
			Download: (format, type, id) => retrieve('cfdi/' + format + '/' + type, id),
			Acuse: (format, type, id) => retrieve('acuse/' + format + '/' + type, id)
		},
		Certificates: {
			Get: (param) => listWithParam('api-lite/csds/', param),
			List: () => list('api-lite/csds'),
			Create: (data) => postSyncWithData('api-lite/csds', data),
			Update: (param, data) => putSyncWithData('api-lite/csds/' + param, data),
			Remove: (params) => deleteSyncWithParam('api-lite/csds', params)
		},
		Catalogs: {
			States: () => list('catalogs/States?countryCode=MEX'),
			Municipalities: (state) => list('catalogs/municipalities?stateCode=' + state),
			Localities: (state) => list('catalogs/localities?stateCode=' + state),
			Neighborhoods: (postalCode) => list('catalogs/neighborhoods?postalCode=' + postalCode),
			ProductsOrServices: (keyword) => list('catalogs/ProductsOrServices?keyword=' + keyword),
			Units: (keyword) => list('catalogs/Units?keyword=' + keyword),
			CFDIUses: () => list('catalogs/CfdiUses'),
			FiscalRegimens: () => list('catalogs/FiscalRegimens'),
			PaymentForms: () => list('catalogs/PaymentForms'),
			PaymentMethods: () => list('catalogs/PaymentMethods'),
			NameIds: () => list('catalogs/NameIds'),
		},
		getToken: () => "Basic " + valuesFacturama.token,
	};

	return facturamaObject;
};

module.exports = facturama;