
import { Cloudinary } from "@cloudinary/url-gen";

const cld = new Cloudinary({
  cloud: {
    cloudName: 'dtkeeaepu' // Found on your Cloudinary Dashboard
  }
});

export default cld;