export default class APIConfig {
	public readonly loadURL = '';
	public readonly resetURL = '';
	public readonly addExperimentURL = '';
	public readonly addResearcherURL = '';
	public readonly addReviewURL = '';
	public readonly updateExperimentTitleURL = '';
	public readonly updateExperimentRatingURL = '';
	public readonly updateReviewURL = '';

    constructor(config: object) {
        Object.assign(this, config);
    }

    public static from(config: object) : APIConfig {
        return new APIConfig(config);
    }
};
