type callback('a, 'b) = 'a => 'b;
[@bs.module "lodash"]
external uniqBy: (array('a), callback('a, 'b)) => array('a) = "uniqBy";