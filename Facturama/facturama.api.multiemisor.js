const { FACTURAMA_TOKEN, NODE_ENV } = require("../../../constants/environments");
const { errorHandler } = require("../misc/errorHandler.json")
const axios = require('axios').default;
/*
Soporte API Facturama
	soporte-api@facturama.mx
*/



const valuesFacturama = {
	token: FACTURAMA_TOKEN,
	url: NODE_ENV === "production" ? "https://api.facturama.mx/" : "https://apisandbox.facturama.mx/"
};
const instance = axios.create({
	baseURL: valuesFacturama.url,
});

instance.defaults.headers.common["Authorization"] = "Basic " + valuesFacturama.token;

function formatError(error) {
	let errorMessage = ""
	if (error.Message) {
		if (errorHandler.response.hasOwnProperty(error.Message)) errorMessage += errorHandler.response[error.Message]
		else errorMessage += `${error.Message} `;
	}
	if (error.ModelState) {
		Object.entries(error.ModelState).forEach(([key, value]) => {
			if (value.length > 0) {
				if (errorHandler.response.hasOwnProperty(key)) errorMessage += errorHandler.response[key]
				else errorMessage += `${value.join(', ')}.\n`;
			}
		})
	}
	return errorMessage;
}

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
		return instance.post(path + param).then(response => response.data).catch(e => {
			const error = e.response.data;
			console.log("ERROR FACTURAMA postSyncWithParam:", error);
			const errorMessage = formatError(error)
			throw errorMessage;
		});
	};

	const postSyncWithData = (path, data) => {
		return instance.post(path, data, {
			headers: {
				'Content-Type': 'application/json',
			}
		}).then(response => response.data).catch(e => {
			const error = e.response.data;
			console.log("ERROR FACTURAMA postSyncWithData:", error);
			const errorMessage = formatError(error)
			throw errorMessage;
		})
			;
	};

	const putSyncWithData = (path, data) => {
		return instance.put(path, data, {
			headers: {
				'Content-Type': 'application/json',
			}
		}).then(response => response.data).catch(e => {
			const error = e.response.data;
			console.log("ERROR FACTURAMA putSyncWithData:", error);
			const errorMessage = formatError(error)
			throw errorMessage;
		});
	};

	const deleteSyncWithParam = (path, param) => {
		return instance.delete(path + '/' + param)
			.then(response => response.data)
			.catch(e => {
				const error = e.response.data;
				console.log("ERROR FACTURAMA deleteSyncWithParam:", e.response);
				const errorMessage = formatError(error)
				throw errorMessage;
			});;
	};

	const GetInformationCerFile = (base64CerFile) => {
		const crypto = require("crypto")

		const cerFile = Buffer.from(base64CerFile, 'base64');
		const cerAttributes = new crypto.X509Certificate(cerFile)

		const subjectComponents = cerAttributes.subject.split('\n');
		const issuerComponents = cerAttributes.issuer.split('\n');
		const subjectObject = {};
		subjectComponents.forEach(component => {
			const [key, value] = component.split('=');
			subjectObject[key] = value;
		});
		const issuerObject = {};
		issuerComponents.forEach(component => {
			const [key, value] = component.split('=');
			issuerObject[key] = value;
		});

		return { subjectObject, issuerObject, expiration: new Date(cerAttributes.validTo) };
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
			GetInformationCerFile: (base64CerFile) => GetInformationCerFile(base64CerFile),
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

module.exports = facturama();