const {NODE_ENV} = process.env;

export const development = NODE_ENV !== 'production';
