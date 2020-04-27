import express from 'express';
import fs from 'fs-extra';
import cors from 'cors';
import bodyParser from 'body-parser';
import multer from 'multer';

const api = {
	_json: (res, obj) => {
	    res.writeHead(200, {
	        'Content-Type': 'application/json',
	        'Access-Control-Allow-Origin': '*',
	        'Access-Control-Allow-Methods': '*'
	    });
	    res.end(JSON.stringify(obj, null, 4));
	},

	_ok: res => {
	    api._json(res, {status: 'ok', message: 'OK'});
	},

	_error: (res, message) => {
	    res.writeHead(404, { 'Content-Type': 'application/json' });
	    res.end(JSON.stringify({ status: 'error', message }, null, 4));
	},
	
	/** API **/
	
	experiments_list: async (req, res) => {
	  	try {
		  	const data = await fs.readFile('./data/data.json');
		  	api._json(res, JSON.parse(data));
	  	} catch (err) {
		  	api._error(res, err);
	  	}
    },
	
	reset: async (req, res) => {
  		try {
  	  	    await fs.copyFile('./data/orig_data.json', './data/data.json');
		    api._ok(res);
  	    } catch (err) {
		    api._error(res, 'Could not reset data file: ' + err);
  	    }
    },
	
	experiment_add: async (req, res) => {
		if (!req.body.title) {
			api._error(res, 'Experiment data did not include a title.');
		} else {
			try {
				const data = await fs.readFile('./data/data.json');
				const d = JSON.parse(data);
				const id = d.experiments[d.experiments.length - 1].id + 1;
				const experiment = {id, title: req.body.title };
				experiment.description = req.body.description || '';
				experiment.rating = parseFloat(req.body.rating) || 0;
				d.experiments.push(experiment);
				await fs.writeFile('./data/data.json', JSON.stringify(d, null, 4));
				api._json(res, {type: 'experiment_added', id, title: req.body.title});
			} catch (err) {
				api._error(res, `Could not add experiment ${req.body.title}: ${err}`);
			}
		}
	},
	
	researcher_add: async (req, res) => {
		if (!req.body.name) {
			api._error(res, 'Researcher data did not include a name.');
		} else {
			try {
				const data = await fs.readFile('./data/data.json');
				const d = JSON.parse(data);
				const id = d.researchers[d.researchers.length - 1].id + 1;
				d.researchers.push({id, name: req.body.name });
				await fs.writeFile('./data/data.json', JSON.stringify(d, null, 4));
				api._json(res, {type: 'researcher_added', id, name: req.body.name});
			} catch (err) {
				api._error(res, `Could not add researcher ${req.body.name}: ${err}`);
			}
		}
	},
	
	review_add: async (req, res) => {
		if (!(req.body.researcherId && req.body.experimentId && req.body.score)) {
			api._error(res, 'Review data did not include all necessary fields.');
		} else {
			try {
				const data = await fs.readFile('./data/data.json');
				const d = JSON.parse(data);
				const id = d.reviews[d.reviews.length - 1].id + 1;
				d.reviews.push({id, researcherId: parseInt(req.body.researcherId), experimentId: parseInt(req.body.experimentId), score: parseFloat(req.body.score)});
				await fs.writeFile('./data/data.json', JSON.stringify(d, null, 4));
				api._json(res, {type: 'review_added', id});
			} catch (err) {
				api._error(res, `Could not add review: ${err}`);
			}
		}
	},
	
	experiment_update_title: async (req, res) => {
		if (!(req.body.experimentId && req.body.title)) {
			api._error(res, 'Experiment data did not include all necessary fields.');
		} else {
			try {
				const data = await fs.readFile('./data/data.json');
				const d = JSON.parse(data);
				const experiment = d.experiments.find(o => o.id === parseInt(req.body.experimentId));
				experiment.title = req.body.title;
				await fs.writeFile('./data/data.json', JSON.stringify(d, null, 4));
				api._json(res, {type: 'experiment_updated_title', id: experiment.id, title: experiment.title});
			} catch (err) {
				api._error(res, `Could not update experiment: ${err}`);
			}
		}
	},
	
	experiment_update_rating: async (req, res) => {
		if (!(req.body.experimentId && req.body.rating)) {
			console.log('is error');
			api._error(res, 'Experiment data did not include all necessary fields.');
		} else {
			try {
				const data = await fs.readFile('./data/data.json');
				const d = JSON.parse(data);
				const experiment = d.experiments.find(o => o.id === parseInt(req.body.experimentId));
				experiment.rating = parseFloat(req.body.rating);
				await fs.writeFile('./data/data.json', JSON.stringify(d, null, 4));
				api._json(res, {type: 'experiment_updated_rating', id: experiment.id, rating: experiment.rating});
			} catch (err) {
				api._error(res, `Could not update experiment: ${err}`);
			}
		}
	},

	review_update: async (req, res) => {
		if (!(req.body.researcherId && req.body.experimentId && req.body.score)) {
			api._error(res, 'Review data did not include all necessary fields.');
		} else {
			try {
				const data = await fs.readFile('./data/data.json');
				const d = JSON.parse(data);
				const researcherId = parseInt(req.body.researcherId);
				const experimentId = parseInt(req.body.experimentId);
				const review = d.reviews.find(o => o.researcherId === researcherId && o.experimentId === experimentId);
				review.score = parseFloat(req.body.score);
				await fs.writeFile('./data/data.json', JSON.stringify(d, null, 4));
				api._json(res, {type: 'review_updated', id: review.id});
			} catch (err) {
				api._error(res, `Could not update review: ${err}`);
			}
		}
	}
};


export default (app, http) => {
	app.use(cors());
	app.use(bodyParser.urlencoded({extended: false}));
	app.use(bodyParser.json());
	app.use(multer().any());
	
	app.get('/experiments', api.experiments_list);
	app.post('/reset', api.reset);
	app.post('/researcher-add', api.researcher_add);
	app.post('/experiment-add', api.experiment_add);
	app.post('/review-add', api.review_add);
	app.post('/experiment-update-title', api.experiment_update_title);
	app.post('/experiment-update-rating', api.experiment_update_rating);
	app.post('/review-update', api.review_update);
}
