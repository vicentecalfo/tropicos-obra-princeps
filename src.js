const optionDefinitions = [
	{ name: 'input', alias: 'i', type: String },
	{ name: 'output', alias: 'o', type: String },
	{ name: 'apiKey', alias: 'k', type: String }
];

import commandLineArgs from 'command-line-args';
const { input, output, apiKey } = commandLineArgs(optionDefinitions);
import csv from 'csvtojson';
import fs from 'fs-extra';
import * as FlexSearch from 'flexsearch';
import { TropicosApi } from '@vicentecalfo/tropicos-api-wrapper';

const tropicosApi = new TropicosApi({
	apiKey,
	format: 'json'
});

async function init() {
	try {
		const speciesList = await getSpecies();
		const references = [ [ 'scientificNameWithAuthors', 'displayReference', 'displayDate' ] ];
		const notFound = [ [ 'scientificNameWithAuthors' ] ];
		for (let i = 0; i < speciesList.length; i++) {
			const name = formatName(speciesList[i].scientificNameWithAuthors);
			const foundSpecies = await search(name.scientificName);
			if (foundSpecies.length === 0) {
				notFound.push(speciesList[i].scientificNameWithAuthors);
			} else {
				const reference = await getReference(name.scientificNameWithAuthors, foundSpecies);
				if (reference) {
					references.push(Object.values(reference));
				} else {
					notFound.push([ name.scientificNameWithAuthors ]);
				}
			}
		}
		buildOutput(output, references, notFound);
		console.log('Arquivos salvos.');
	} catch (error) {
		console.log(error);
	}
}

function buildOutput(output, references, notFound) {
	const referenceFile = references.map((reference) => reference.join(',')).join('\n');
	fs.outputFileSync('./' + output, referenceFile);
	const notFoundFile = notFound.map((specie) => specie.join(',')).join('\n');
	const notFoundFilename = `${output.substring(0, output.lastIndexOf('.')) || output}-notFound.csv`;
	fs.outputFileSync('./' + notFoundFilename, notFoundFile);
	//console.log(referenceFile);
	//console.log(notFoundFile);
}

async function getReference(scientificNameWithAuthors, results) {
	return new Promise(async (resolve) => {
		console.log(`Buscando obra princeps de: ${scientificNameWithAuthors}.`);
		const index = new FlexSearch.default({
			encode: 'extra',
			doc: {
				id: 'NameId',
				field: 'ScientificNameWithAuthors'
			}
		});
		index.add(results);
		const result = await index.search(scientificNameWithAuthors, { field: [ 'ScientificNameWithAuthors' ] });
		if (result.length === 1) {
			const reference = {
				scientificNameWithAuthors: `"${result[0].ScientificNameWithAuthors}"`,
				displayReference: `"${result[0].DisplayReference}"`,
				displayDate: `"${result[0].DisplayDate}"`
			};
			resolve(reference);
		} else {
			resolve(null);
		}
	});
}

function search(name) {
	return new Promise(async (resolve, reject) => {
		try {
			const { body } = await tropicosApi.search({ name }).toPromise();
			resolve(JSON.parse(body));
		} catch (error) {
			reject(error);
		}
	});
}

function getSpecies() {
	return new Promise(async (resolve, reject) => {
		try {
			const speciesList = await csv().fromFile(input);
			resolve(speciesList);
		} catch (error) {
			reject(error);
		}
	});
}

function formatName(name) {
	const scientificNameWithAuthors = name;
	name = name.split(' ');
	const genus = name[0];
	const specificEpithet = name[1];
	const scientificName = `${genus} ${specificEpithet}`;
	name.splice(0, 2);
	const author = name.join(' ');
	return {
		genus,
		specificEpithet,
		author,
		scientificNameWithAuthors,
		scientificName
	};
}

init();

// search('Mimosa scabrella').then(result => {
// 	console.log(result);
// });

// getSpecies().then(result =>{
// 	console.log(result);
// })
