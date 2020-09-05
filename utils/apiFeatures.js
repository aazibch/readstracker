class ApiFeatures {
    constructor(query, queryProperties) {
        this.query = query;
        this.queryProperties = queryProperties;
    }

    filter() {
        let filterObj = { ...this.queryProperties };
        const propertiesToExclude = ['sort', 'fields', 'page', 'limit'];

        Object.keys(filterObj).forEach(e => {
            if (propertiesToExclude.includes(e)) {
                delete filterObj[e];
            }
        });

        filterObj = JSON.parse(JSON.stringify(filterObj).replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`));
        this.query = this.query.find(filterObj);
        return this;
    }

    sort() {
        if (this.queryProperties.sort) {
            const sortValue = this.queryProperties.sort.split(',').join(' ');
            this.query = this.query.sort(sortValue);
        }

        return this;
    }

    limitFields() {
        let selectValue;

        if (this.queryProperties.fields) {
            selectValue = this.queryProperties.fields.split(',').join(' ');
        } else {
            selectValue = '-__v';
        }

        this.query = this.query.select(selectValue);
        return this;
    }

    paginate() {
        const limitVal = +this.queryProperties.limit || 5;
        const pageVal = +this.queryProperties.page || 1;
        const skipVal = (pageVal - 1) * limitVal;

        this.query = this.query.skip(skipVal).limit(limitVal);
        return this;
    }
};

module.exports = ApiFeatures;