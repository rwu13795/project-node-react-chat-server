import "dotenv/config";

import { app } from "./app";
import { connectToDatabase } from "./utils/database/db-connection";
import connectSocketIO from "./socket-io/socket-io-connection";

connectToDatabase();

const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  console.log(`> > > > >  Listening on port ${port}  < < < < <`);
});

connectSocketIO(server);

// NOTE //
/*
  The node cluster worked perfectly in development, but after I deployed it on heroku, 
  the cors in both the "index" and "socket-io-connection" are completely broken. 
  There are always some inconsistent errors with the cors. 
  sometimes the request and socket-connection work just fine, but other times some
  or all the requests are just blocked.

  I have tried all sort of combination fo the origin, but it did not work. 

  At last, I have to dump the cluster altogether. The sever now works as expected
*/
