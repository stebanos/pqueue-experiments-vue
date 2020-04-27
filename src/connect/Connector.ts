import axios from 'axios';
import APIConfig from './APIConfig';
import PQueue from 'p-queue';

export default class Connector {
	private apiConfig: APIConfig;
	private queue = new PQueue({concurrency: 1});

	public isSaving = false;
	
	constructor(apiConfig: APIConfig) {
		this.apiConfig = apiConfig;
		this.finishSaving = this.finishSaving.bind(this);
	}
	
	finishSaving() {
		this.isSaving = false;
	}
	
    async load() {
   	    const res = await axios.get(this.apiConfig.loadURL);
	    return res.data;
    }
	
    async reset() {
        const res = await axios.post(this.apiConfig.resetURL);
		return res.statusText;
    }
	
	async addExperiment(title: string, description: string = '', rating: number = 0) {
		const res = await this.executeAPIRequest(this.apiConfig.addExperimentURL, { title, description, rating}) as any;
		console.log('experiment added:', res.title);
	}
	
	async addResearcher(name: string) {
		const res = await this.executeAPIRequest(this.apiConfig.addResearcherURL, { name }) as any;
		console.log('researcher added:', res.name);
	}
	
	async addReview(experimentId: number, researcherId: number, score: number) {
		const res = await this.executeAPIRequest(this.apiConfig.addReviewURL, { experimentId, researcherId, score }) as any;
		console.log('review added with id', res.id);
	}
	
	async updateExperimentTitle(experimentId: number, title: string) {
		const res = await this.executeAPIRequest(this.apiConfig.updateExperimentTitleURL, { experimentId, title }) as any;
		console.log(`experiment ${res.id} updated with title ${res.title}.`);
	}
	
	async updateExperimentRating(experimentId: number, rating: number) {
		const res = await this.executeAPIRequest(this.apiConfig.updateExperimentRatingURL, { experimentId, rating }) as any;
		console.log(`experiment ${res.id} updated with rating ${res.rating}.`);
	}
	
	async updateReview(experimentId: number, researcherId: number, score: number) {
		const res = await this.executeAPIRequest(this.apiConfig.updateReviewURL, { experimentId, researcherId, score }) as any;
		console.log('review updated with id', res.id);
	}
	
	async executeAPIRequest(apiURL: string, parameters: any) {
		return new Promise((resolve, reject) => {
            this.queue.add(async () => {
				this.isSaving = true;
                const formData = new FormData();
                for (const [key, value] of Object.entries(parameters)) {
                    formData.set(key, value as any);
                }
				
				try {
					const result = await axios.post(apiURL, formData);
					resolve(result.data);
				} catch (err) {
					reject(err);
				}
			});
	        this.queue.onIdle().then(this.finishSaving);
		});
	}
}
