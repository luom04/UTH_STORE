export class ApiFeatures {
  constructor(query, queryParams) {
    this.query = query;
    this.queryParams = queryParams;
  }
  filter() {
    const q = { ...this.queryParams };
    ["page", "limit", "sort", "fields"].forEach((k) => delete q[k]);
    // advanced: gte, lte, gt, lt => price[gte]=1000
    let queryStr = JSON.stringify(q).replace(
      /\b(gte|gt|lte|lt)\b/g,
      (m) => `$${m}`
    );
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }
  sort() {
    if (this.queryParams.sort) {
      const sortBy = this.queryParams.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }
  limitFields() {
    if (this.queryParams.fields) {
      const fields = this.queryParams.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    }
    return this;
  }
  paginate() {
    const page = parseInt(this.queryParams.page) || 1;
    const limit = Math.min(parseInt(this.queryParams.limit) || 20, 100);
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    this.meta = { page, limit };
    return this;
  }
}
