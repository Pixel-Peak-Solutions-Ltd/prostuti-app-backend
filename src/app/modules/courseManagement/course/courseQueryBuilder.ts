import { FilterQuery, Query } from 'mongoose';

class QueryBuilder<T> {
    public modelQuery: Query<T[], T>;
    public query: Record<string, unknown>;

    constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>) {
        this.modelQuery = modelQuery;
        this.query = query;
    }

    filter() {
        const queryObj = { ...this.query }; // copy of real query object

        const excludeFields = ['searchTerm', 'sort', 'limit', 'page', 'fields'];

        excludeFields.forEach((el) => delete queryObj[el]);

        this.modelQuery = this.modelQuery.find(queryObj as FilterQuery<T>);

        return this;
    }

    sort() {
        if (this?.query?.sort) {
            const sort = (this?.query?.sort as string)?.split(',')?.join(' ');
            this.modelQuery = this.modelQuery.sort(sort as string);
        } else {
            this.modelQuery = this.modelQuery.sort('-createdAt');
        }

        return this;
    }

    paginate() {
        const page = Number(this?.query?.page) || 1;
        const limit = Number(this?.query?.limit) || 10;
        const skip = (page - 1) * limit;

        this.modelQuery = this.modelQuery.skip(skip).limit(limit);

        return this;
    }
}

export default QueryBuilder;
