export class APIfeatures {
  constructor(requestQuery, responQuery) {
    this.requestQuery = requestQuery;
    this.responQuery = responQuery;
  }

  fillter() {
    //
    const queryObj = { ...this.requestQuery };
    const deletFromQuery = ["page", "sort", "limit", "fields"];
    deletFromQuery.forEach((el) => delete queryObj[el]);

    //math operator handeling
    let querystr = JSON.stringify(queryObj);
    querystr = querystr.replace(/\b(gt|gte|lt|lte)\b/g, (el) => `$${el}`);

    this.responQuery = this.responQuery.find(JSON.parse(querystr));

    return this;
  }

  sort() {
    if (this.requestQuery.sort) {
      let sortBy = this.requestQuery.sort.split(",").join(" ");
      this.responQuery.sort(sortBy);
    } else {
      this.responQuery.sort("-Date");
    }
    return this;
  }

  fields() {
    if (this.requestQuery.fields) {
      let field = this.requestQuery.fields.split(",").join(" ");
      this.responQuery = this.responQuery.select(field);
    } else {
      this.responQuery = this.responQuery.select("-__v");
    }
    return this;
  }

  pagination() {
    const page = Number(this.requestQuery.page) || 1;
    const limit = Number(this.requestQuery.limit) || 100;
    const skip = (page - 1) * limit;
    this.responQuery.skip(skip).limit(limit);

    return this;
  }
}
