import {CountryComponent} from "@/lib/graphql/lib/country";
import {RecordsComponent} from "@/lib/graphql/lib/record";

const resolvers = [CountryComponent.resolvers, RecordsComponent.resolvers]

export {resolvers}