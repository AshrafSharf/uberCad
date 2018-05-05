import * as THREE from '../extend/THREE'

let buildEdgeModel = (object, threshold = 0.000001) => {
  let vertices = getVertices(object.children);
  let regions = [];

  //get entities without vertices in paths
  let entities = skipZeroLines([...object.children], threshold);

  // check for intersections
  entities.forEach(entityToCheck => {
    delete entityToCheck.userData.noIntersections;

    entities.forEach(entity => {
      if (entity === entityToCheck || entity.userData.noIntersections) {
        return;
      }

      if (!(entity.geometry instanceof THREE.CircleGeometry) && !(entityToCheck.geometry instanceof THREE.CircleGeometry)) {
        //line to line

        // console.count('check for intersection');
        if (linesIntersect(entity.geometry.vertices[0], entity.geometry.vertices[1], entityToCheck.geometry.vertices[0], entityToCheck.geometry.vertices[1])) {

          //check if all vertices far enough from each other
          if (
            entity.geometry.vertices[0].distanceTo(entityToCheck.geometry.vertices[0]) > threshold
            && entity.geometry.vertices[0].distanceTo(entityToCheck.geometry.vertices[1]) > threshold
            && entity.geometry.vertices[1].distanceTo(entityToCheck.geometry.vertices[0]) > threshold
            && entity.geometry.vertices[1].distanceTo(entityToCheck.geometry.vertices[1]) > threshold
          ) {
            console.error('INTERSECTION', entityToCheck, entity);
            // console.warn(entity.geometry.vertices[0], entity.geometry.vertices[1], entityToCheck.geometry.vertices[0], entityToCheck.geometry.vertices[1]);
            // [entityToCheck, entity]

            let error = new Error('There are entities intersected in object')
            error.userData = {
              error: 'intersection',
              type: 'line to line',
              msg: 'There are entities intersected in object',
              entities: [entityToCheck, entity]
            }
            throw error

            // throw  {
            //   error: 'intersection',
            //   type: 'line to line',
            //   msg: 'There are entities intersected in object',
            //   entities: [entityToCheck, entity]
            // }
          }


        }
      } else if (entity.geometry instanceof THREE.CircleGeometry && entityToCheck.geometry instanceof THREE.CircleGeometry) {
        //arc to arc
        let intersectionResult = arcsIntersect(entity, entityToCheck);
        if (intersectionResult) {
          // alert('ARC INTERSECTION!!! YEAH!!!');


          let arc1v1 = new THREE.Vector3(0, 0, 0);
          arc1v1.addVectors(intersectionResult.arc1.geometry.vertices[0], intersectionResult.arc1.position);

          let arc1v2 = new THREE.Vector3(0, 0, 0);
          arc1v2.addVectors(intersectionResult.arc1.geometry.vertices[intersectionResult.arc1.geometry.vertices.length - 1], intersectionResult.arc1.position);

          let arc2v1 = new THREE.Vector3(0, 0, 0);
          arc2v1.addVectors(intersectionResult.arc2.geometry.vertices[0], intersectionResult.arc2.position);

          let arc2v2 = new THREE.Vector3(0, 0, 0);
          arc2v2.addVectors(intersectionResult.arc2.geometry.vertices[intersectionResult.arc2.geometry.vertices.length - 1], intersectionResult.arc2.position);


          if (
            arc1v1.distanceTo(intersectionResult.intersectPoint) > threshold &&
            arc1v2.distanceTo(intersectionResult.intersectPoint) > threshold &&
            arc2v1.distanceTo(intersectionResult.intersectPoint) > threshold &&
            arc2v2.distanceTo(intersectionResult.intersectPoint) > threshold
          ) {
            console.error('INTERSECTION', entityToCheck, entity);
            // console.warn(entity.geometry.vertices[0], entity.geometry.vertices[1], entityToCheck.geometry.vertices[0], entityToCheck.geometry.vertices[1]);
            // [entityToCheck, entity]

            let error = new Error('There are entities intersected in object')
            error.userData = {
              error: 'intersection',
              type: 'arc to arc',
              msg: 'There are entities intersected in object',
              entities: [entityToCheck, entity]
            }
            throw error

            // throw  {
            //   error: 'intersection',
            //   type: 'arc to arc',
            //   msg: 'There are entities intersected in object',
            //   entities: [entityToCheck, entity]
            // }
          }
        }


      } else {
        //line to arc
        let arc, line;

        if (entity.geometry instanceof THREE.CircleGeometry) {
          arc = entity;
          line = entityToCheck;
        } else {
          arc = entityToCheck;
          line = entity;
        }

        let intersectionResult = lineArcIntersect(line, arc);
        if (intersectionResult) {
          //possibly intersection. check for threshold

          let arc1v1 = new THREE.Vector3(0, 0, 0);
          arc1v1.addVectors(arc.geometry.vertices[0], arc.position);

          let arc1v2 = new THREE.Vector3(0, 0, 0);
          arc1v2.addVectors(arc.geometry.vertices[arc.geometry.vertices.length - 1], arc.position);

          let line1v1 = line.geometry.vertices[0].clone();

          let line1v2 = line.geometry.vertices[1].clone();

          if (
            arc1v1.distanceTo(line1v1) > threshold &&
            arc1v1.distanceTo(line1v2) > threshold &&
            arc1v2.distanceTo(line1v1) > threshold &&
            arc1v2.distanceTo(line1v2) > threshold
          ) {
            console.error('INTERSECTION', entityToCheck, entity);
            // console.warn(entity.geometry.vertices[0], entity.geometry.vertices[1], entityToCheck.geometry.vertices[0], entityToCheck.geometry.vertices[1]);
            // [entityToCheck, entity]

            let error = new Error('There are entities intersected in object')
            error.userData = {
              error: 'intersection',
              type: 'line to arc',
              msg: 'There are entities intersected in object',
              entities: [arc, line]
            }
            throw error

            // throw  {
            //   error: 'intersection',
            //   type: 'line to arc',
            //   msg: 'There are entities intersected in object',
            //   entities: [arc, line]
            // }
          }
        }

      }
    });
    entityToCheck.userData.noIntersections = true;
  });



  let prevEntitiesCount = -1;
  do {
    regions.forEach(region => {
      region.path.forEach(vertex => {
        let idx = entities.indexOf(vertex.parent);
        if (idx > -1) {
          entities.splice(idx, 1);
        }
      });
    });

    let startVertex = vertices.find(v => entities.indexOf(v.parent) >= 0);

    if (prevEntitiesCount !== entities.length) {
      prevEntitiesCount = entities.length;
    } else {
      let error = new Error('Not all entities in use!')
      error.userData = {
        error: 'unused entities',
        msg: 'Not all entities in use!',
        entities: entities
      }
      throw error

      // throw  {
      //   error: 'unused entities',
      //   msg: 'Not all entities in use!',
      //   entities: entities
      // }
    }

    if (entities.length) {
      let path = buildChain(vertices, startVertex, threshold);
      regions.push({
        path,
        boundingBox: buildBoundingBox(path)
      });


    }





    // console.log('entities', entities.length);
  } while (entities.length);


  if (regions.length) {
    //make outer region clockwise. other regions counterclockwise
    let outerRegion = regions[0];

    regions.forEach(region => {
      if (region.boundingBox.area > outerRegion.boundingBox.area) {
        outerRegion = region;
      }
    });

    //set outer region first
    regions.unshift(...regions.splice(regions.indexOf(outerRegion), 1));

    regions.forEach(region => {
      if (isClockwise(region.path)) {
        if (region === outerRegion) {
          //make outer region counterclockwise
          region.path.reverse();
        }
      } else {
        //counterclockwise

        if (region !== outerRegion) {
          // make inner region clockwise
          region.path.reverse();
        }
      }
    });
  }


  // console.log('regions', regions);

  let pathD = '';
  let subRegionsPathD = [];
  let vertexList = [];
  regions.forEach((region, idx) => {
    let last = region.path[region.path.length - 1];
    let lastVertex = `${(last.x / 1000).toFixed(4)},${(last.y / 1000).toFixed(4)}`;

    let p = `M${lastVertex} L`;

    region.path.forEach(v => {
      let vertex = `${(v.x / 1000).toFixed(4)},${(v.y / 1000).toFixed(4)}`;
      if (vertex !== lastVertex && vertexList.indexOf(vertex) < 0) {
        p += `${vertex} `;
        lastVertex = vertex;
        vertexList.push(vertex);
      }
    });
    pathD += p;
    if (idx) {
      subRegionsPathD.push(p);
    }
  });

  let viewBox = {
    x: (Math.min(...vertices.map(v => v.x)) / 1000).toFixed(4),
    y: (Math.min(...vertices.map(v => v.y)) / 1000).toFixed(4),
    width: ((Math.max(...vertices.map(v => v.x)) - Math.min(...vertices.map(v => v.x))) / 1000).toFixed(4),
    height: ((Math.max(...vertices.map(v => v.y)) - Math.min(...vertices.map(v => v.y))) / 1000).toFixed(4)
  };

  return {
    regions, //outer region goes first
    svgData: {
      viewBox,
      pathD,
      subRegionsPathD,
      insidePoint: getInsidePoint(regions, threshold)
    }
  };
}

let buildChain = (vertices, startVertex, threshold = 0.000001, vertex, path = []) => {
    if (!vertex) {
    vertex = startVertex;
  }

  let entity = vertex.parent;
  if (entity.geometry instanceof THREE.CircleGeometry) {
    //arc

    let v = new THREE.Vector3(0, 0, 0);
    v.addVectors(entity.geometry.vertices[0], entity.position);

    let vertices = [...entity.geometry.vertices];
    if (vertex.distanceTo(v) > threshold) {
      //reverse order
      vertices.reverse();
    }

    vertices.forEach((v, idx, array) => {
      if (idx >= array.length - 1) {
        //skip last element
        return;
      }
      let vertice = new THREE.Vector3(0, 0, 0);
      vertice.parent = entity;
      path.push(vertice.addVectors(v, entity.position));
    });
  } else {
    //line
    path.push(vertex);
  }





  let anotherVertex = vertices.find(item => item.parent === vertex.parent && item !== vertex);

  let nearestVertex;
  let distances = [];
  vertices.forEach(v => {
    if (v === anotherVertex) {
      return false;
    }
    distances.push({
      vertex: v,
      distance: anotherVertex.distanceTo(v)
    });
  });

  //get closest vertex
  let minDistance = distances.pop();
  distances.forEach(distance => {
    if (distance.distance < minDistance.distance) {
      minDistance = distance;
    }
  });

  if (minDistance.distance > threshold) {

    let error = new Error('Interruption detected. Operation canceled')
    error.userData = {
      error: 'interruption',
      msg: 'Interruption detected. Operation canceled',
      entity: vertex.parent,
      minDistance: minDistance
    }

    console.error(error.userData)
    throw error

    // throw {
    //   error: 'interruption',
    //   msg: 'Interruption detected. Operation canceled',
    //   entity: vertex.parent,
    //   minDistance: minDistance
    // };
  }

  nearestVertex = minDistance.vertex;

  if (anotherVertex === startVertex || nearestVertex === startVertex) {
    return path;
  }

  return buildChain(vertices.filter(v => v !== anotherVertex && v !== nearestVertex), startVertex, threshold, nearestVertex, path);
}

let buildBoundingBox = vertices => {
  let boundingBox = {
    x1: Math.min(...vertices.map(v => v.x)),
    y1: Math.min(...vertices.map(v => v.y)),
    x2: Math.max(...vertices.map(v => v.x)),
    y2: Math.max(...vertices.map(v => v.y))
  };
  boundingBox.area = Math.abs((boundingBox.x1 - boundingBox.x2) * (boundingBox.y1 - boundingBox.y2));
  return boundingBox;
}

let isClockwise = vertices => {
  let sum = 0;

  if (vertices) {
    let prevVertex = vertices[vertices.length - 1];

    vertices.forEach(vertex => {
      sum += (vertex.x - prevVertex.x) * (vertex.y + prevVertex.y);
      prevVertex = vertex;
    });
  }

  return sum > 0;
}

let getInsidePoint = (regions, threshold) => {
  let farestPoint = false;

  if (regions.length) {
    let path = regions[0].path;

    let width = Math.max(...path.map(v => v.x)) - Math.min(...path.map(v => v.x)),
      height = Math.max(...path.map(v => v.y)) - Math.min(...path.map(v => v.y));
    let minDistanceFromBorder = Math.min(width, height) / 20;
    let points = [];
    let firstPoint = path[0];

    let entities = [];
    path.forEach(vertex => {
      if (!entities.includes(vertex.parent)) {
        entities.push(vertex.parent);
      }
    });

    let bestPoints = 0;
    for (let i = 0; i < 3; i++) {
      let attempts = 0;
      while (points.length < i*3 + 3 || attempts < 20) {
        let secondPoint = path[parseInt(Math.random() * path.length, 10)];

        let midPoint = {
          x: (firstPoint.x + secondPoint.x) / 2,
          y: (firstPoint.y + secondPoint.y) / 2,
          z: 0
        };

        if (insidePolygon(path, midPoint)) {
          //try to do it simplest way...
          let minDistance = 999999999;
          entities.forEach(entity => {
            let distance = distanceToEntity(midPoint, entity);
            if (distance < minDistance) {
              minDistance = distance;
            }
          });

          points.push({
            minDistance,
            point: midPoint
          });

          if (minDistance > minDistanceFromBorder) {
            bestPoints++
          }
          if (bestPoints >= 2) {
            //if there are 2+ points, select one farest from border (that far enough: 10000*threshold)
            let maxDistance = 0;
            points.forEach(point => {
              if (point.minDistance > maxDistance) {
                maxDistance = point.minDistance;
                farestPoint = point.point;
              }
            });

            // if there are no vertex further than 10000*threshold, scripts after that cycle find farest
            return farestPoint;
          }
        }
        attempts++;
      }
      firstPoint = path[parseInt(Math.random() * path.length, 10)];
    }

    if (points.length) {
      let maxDistance = 0;
      points.forEach(point => {
        if (point.minDistance > maxDistance) {
          maxDistance = point.minDistance;
          farestPoint = point.point;
        }
      });
    }

    return farestPoint;
  }
}

let insidePolygon = (polygon = [], vertex) => {
  // There must be at least 3 vertices in polygon[]
  if (polygon.length < 3) {
    return false;
  }

  // Create a point for line segment from p to infinite
  let extreme = {
    x: 99999999999,
    y: vertex.y+9999999999
  };

  // Count intersections of the above line with sides of polygon
  let count = 0


  for (let i = 0; i < polygon.length; i++) {
    let next = (i + 1) % polygon.length;

    // Check if the line segment from 'vertex' to 'extreme' intersects
    // with the line segment from 'polygon[i]' to 'polygon[next]'
    let intersectResult = linesIntersect(polygon[i], polygon[next], vertex, extreme, true);
    if (intersectResult.isIntersects) {
      // If the point 'p' is colinear with line segment 'i-next',
      // then check if it lies on segment. If it lies, return true,
      // otherwise false
      if (intersectResult.collinear) {
        return true
      }
      count++;
    }
  }

  // Return true if count is odd, false otherwise
  return count % 2 === 1;
}

let lineArcIntersect = (line, arc, threshold = 0) => {
  //https://bl.ocks.org/milkbread/11000965

  //http://www.analyzemath.com/Calculators/Circle_Line.html
  //circle (x - h)^2 + (y - k)^2 = r^2
  //line y = m*x + b

  let x1 = line.geometry.vertices[0].x;
  let y1 = line.geometry.vertices[0].y;
  let x2 = line.geometry.vertices[1].x;
  let y2 = line.geometry.vertices[1].y;

  let m = (y2 - y1) / (x2 - x1);
  let b = y1 - m * x1;

  let h = arc.position.x;
  let k = arc.position.y;
  let r = arc.geometry.parameters.radius;

  let A = 1 + m * m;
  let B = -2 * h + 2 * m * b - 2 * k * m;
  let C = h * h + b * b + k * k - 2 * k * b - r * r;
  let delta = B * B - 4 * A * C;

  if (delta < 0 && delta + threshold >= 0) {
    delta = 0;
  }

  if (delta >= 0) {
    let x1 = (-B + Math.sqrt(delta)) / (2 * A);
    let x2 = (-B - Math.sqrt(delta)) / (2 * A);
    let y1 = m * x1 + b;
    let y2 = m * x2 + b;

    let intersectPoint1 = new THREE.Vector3(x1, y1, 0);
    let intersectPoint2 = new THREE.Vector3(x2, y2, 0);

    let arcAngle1 = circleIntersectionAngle(intersectPoint1, arc.position, r);
    let arcAngle2 = circleIntersectionAngle(intersectPoint2, arc.position, r);

    if (!isBetween(line.geometry.vertices[0], line.geometry.vertices[1], intersectPoint1, threshold)) {
      intersectPoint1 = null;
    }

    if (!isBetween(line.geometry.vertices[0], line.geometry.vertices[1], intersectPoint2, threshold)) {
      intersectPoint2 = null;
    }

    //fix problem when thetaStart + thetaLength > 2pi AND arcAngle < thetastart
    if (arc.geometry.parameters.thetaStart + arc.geometry.parameters.thetaLength > Math.PI * 2) {
      if (arc.geometry.parameters.thetaStart > arcAngle1) {
        arcAngle1 += Math.PI * 2;
      }
      if (arc.geometry.parameters.thetaStart > arcAngle2) {
        arcAngle2 += Math.PI * 2;
      }
    }

    //todo: handle tangent line to arc

    if (intersectPoint1 && arcAngle1 >= arc.geometry.parameters.thetaStart && arcAngle1 <= arc.geometry.parameters.thetaStart + arc.geometry.parameters.thetaLength) {
      return {
        mode: 'intersection',
        intersectPoint: intersectPoint1,
        arc: arc,
        line: line,
        arcAngle: arcAngle1,
        distance: 0
      };
    }

    if (intersectPoint2 && arcAngle2 >= arc.geometry.parameters.thetaStart && arcAngle2 <= arc.geometry.parameters.thetaStart + arc.geometry.parameters.thetaLength) {
      return {
        mode: 'intersection',
        intersectPoint: intersectPoint2,
        arc: arc,
        line: line,
        arcAngle: arcAngle2,
        distance: 0
      };
    }

    //in case of threshold-error
    if (threshold) {
      let arc1v1 = new THREE.Vector3(0, 0, 0);
      arc1v1.addVectors(arc.geometry.vertices[0], arc.position);

      let arc1v2 = new THREE.Vector3(0, 0, 0);
      arc1v2.addVectors(arc.geometry.vertices[arc.geometry.vertices.length - 1], arc.position);

      if (intersectPoint1) {
        let distance = Math.min(arc1v1.distanceTo(intersectPoint1), arc1v2.distanceTo(intersectPoint1));
        if (distance < threshold) {
          return {
            mode: 'intersection',
            intersectPoint: intersectPoint1,
            arc: arc,
            line: line,
            arcAngle: arcAngle1,
            distance
          };
        }
      }

      if (intersectPoint2) {
        let distance = Math.min(arc1v1.distanceTo(intersectPoint2), arc1v2.distanceTo(intersectPoint2));
        if (distance < threshold) {
          return {
            mode: 'intersection',
            intersectPoint: intersectPoint2,
            arc: arc,
            line: line,
            arcAngle: arcAngle2,
            distance
          };
        }
      }
    }

  } else {
    //no intersection
  }
  return false;
}

let arcsIntersect = (arc1, arc2) => {
  //http://www.ambrsoft.com/TrigoCalc/Circles2/circle2intersection/CircleCircleIntersection.htm


  let x1 = arc1.position.x, //a
    y1 = arc1.position.y, //b
    x2 = arc2.position.x, //c
    y2 = arc2.position.y; //d
  //
  // let x1 = 3, //a
  //     y1 = 3, //b
  //     x2 = 6, //c
  //     y2 = 3; //d

  let r1 = arc1.geometry.parameters.radius;
  let r2 = arc2.geometry.parameters.radius;

  // let a = 3, b = 3, c = 6, d = 3;
  // let r1 = 3, r2 = 3;

  // Distance between two circles centers
  let D = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

  // Conditions for intersection between two circles
  if (D < r1 + r2 && D > Math.abs(r1 - r2)) {
    //intersection of two circles

    //intersection coordinates
    let z = Math.sqrt((D + r1 + r2) * (D + r1 - r2) * (D - r1 + r2) * (-D + r1 + r2)) / 4;

    let intersectPoint1 = new THREE.Vector3(
      (x1 + x2) / 2 + ((x2 - x1) * (r1 * r1 - r2 * r2)) / (2 * D * D) + 2 * z * (y1 - y2) / (D * D),
      (y1 + y2) / 2 + ((y2 - y1) * (r1 * r1 - r2 * r2)) / (2 * D * D) - 2 * z * (x1 - x2) / (D * D),
      0
    );

    let intersectPoint2 = new THREE.Vector3(
      (x1 + x2) / 2 + ((x2 - x1) * (r1 * r1 - r2 * r2)) / (2 * D * D) - 2 * z * (y1 - y2) / (D * D),
      (y1 + y2) / 2 + ((y2 - y1) * (r1 * r1 - r2 * r2)) / (2 * D * D) + 2 * z * (x1 - x2) / (D * D),
      0
    );

    // let angle = circleIntersectionAngle(intersectPoint1, arc1.position, r1);
    // console.log({angle}, angle/ Math.PI * 180);

    let arc1angle1 = circleIntersectionAngle(intersectPoint1, arc1.position, r1);
    let arc1angle2 = circleIntersectionAngle(intersectPoint2, arc1.position, r1);
    let arc2angle1 = circleIntersectionAngle(intersectPoint1, arc2.position, r2);
    let arc2angle2 = circleIntersectionAngle(intersectPoint2, arc2.position, r2);

    //fix problem when thetaStart + thetaLength > 2pi AND arcAngle < thetastart
    if (arc1.geometry.parameters.thetaStart + arc1.geometry.parameters.thetaLength > Math.PI * 2) {
      if (arc1.geometry.parameters.thetaStart > arc1angle1) {
        arc1angle1 += Math.PI * 2;
      }
      if (arc1.geometry.parameters.thetaStart > arc1angle2) {
        arc1angle2 += Math.PI * 2;
      }
    }

    if (arc2.geometry.parameters.thetaStart + arc2.geometry.parameters.thetaLength > Math.PI * 2) {
      if (arc2.geometry.parameters.thetaStart > arc2angle1) {
        arc2angle1 += Math.PI * 2;
      }
      if (arc2.geometry.parameters.thetaStart > arc2angle2) {
        arc2angle2 += Math.PI * 2;
      }
    }


    if (
      arc1angle1 >= arc1.geometry.parameters.thetaStart && arc1angle1 <= arc1.geometry.parameters.thetaStart + arc1.geometry.parameters.thetaLength &&
      arc2angle1 >= arc2.geometry.parameters.thetaStart && arc2angle1 <= arc2.geometry.parameters.thetaStart + arc2.geometry.parameters.thetaLength
    ) {
      return {
        mode: 'intersection',
        intersectPoint: intersectPoint1,
        arc1: arc1,
        arc2: arc2,
        arc1angle: arc1angle1,
        arc2angle: arc2angle1
      };
    }

    if (
      arc1angle2 >= arc1.geometry.parameters.thetaStart && arc1angle2 <= arc1.geometry.parameters.thetaStart + arc1.geometry.parameters.thetaLength &&
      arc2angle2 >= arc2.geometry.parameters.thetaStart && arc2angle2 <= arc2.geometry.parameters.thetaStart + arc2.geometry.parameters.thetaLength
    ) {
      return {
        mode: 'intersection',
        intersectPoint: intersectPoint2,
        arc1: arc1,
        arc2: arc2,
        arc1angle: arc1angle2,
        arc2angle: arc2angle2
      };
      // alert('intersection of arcs!!!');
    }

  } else if (D === r1 + r2 || Math.abs(r1 - r2) === D) {
    console.warn('Two circles tangency');

    // let x = ((a-c) * (r1*r1-r2*r2)) / (2*(Math.pow(c-a,2)+ Math.pow(d-b,2))) - (a + c) / 2;

    // let x = ((a - c) * (r1 * r1 - r2 * r2)) / (2 * (Math.pow(c - a, 2) + Math.pow(d - b, 2))) - (a + c) / 2;
    // let y = ((b - d) * (r1 * r1 - r2 * r2)) / (2 * (Math.pow(c - a, 2) + Math.pow(d - b, 2))) - (d + b) / 2;
    // console.log({x, y});
    //TODO handle arcs tagnency
    alert('arcs tagnency. How to handle?')
    //calculate tangency point
  } else {
    // console.warn('no intersection');
    return false;
  }
}

let getVertices = entities => {
  let vertices = [];
  entities.forEach(entity => {
    if (entity.geometry instanceof THREE.CircleGeometry) {
      //arc

      let vertice = new THREE.Vector3(0, 0, 0);
      vertice.parent = entity;
      vertices.push(vertice.addVectors(entity.geometry.vertices[0], entity.position));

      vertice = new THREE.Vector3(0, 0, 0);
      vertice.parent = entity;
      vertices.push(vertice.addVectors(entity.geometry.vertices[entity.geometry.vertices.length - 1], entity.position));

    } else {
      //line
      let src = entity.geometry.vertices[0];

      let vertice = new THREE.Vector3(src.x, src.y, 0);
      vertice.parent = entity;
      vertices.push(vertice);

      src = entity.geometry.vertices[1];
      vertice = new THREE.Vector3(src.x, src.y, 0);
      vertice.parent = entity;
      vertices.push(vertice);
    }
  });
  return vertices;
}

let distanceToLine = (vertex, line) => {
  // calculate distance to finite line segment

  let x1 = line.geometry.vertices[0].x
  let y1 = line.geometry.vertices[0].y
  let x2 = line.geometry.vertices[1].x
  let y2 = line.geometry.vertices[1].y

  return distanceToLineSegment(x1, y1, x2, y2, vertex.x, vertex.y)

  // old version calculates distance to infinite line in both directions.

  // //line equation y = mx + b
  // // also - Ax + By + C = 0 (will be used)
  //
  // // https://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
  //
  // let a, b, c;
  //
  // if (x1 !== x2) {
  //     let m = (y2 - y1) / (x2 - x1);
  //     let B = y1 - m * x1;
  //
  //     //y = mx + b;
  //     // Ax + By + C = 0
  //
  //     a = m;
  //     b = -1;
  //     c = B;
  // } else {
  //     a = 1;
  //     b = 0;
  //     c = -x1;
  // }
  //
  // return Math.abs((a*vertex.x + b*vertex.y + c)/Math.sqrt(Math.pow(a,2) + Math.pow(b,2)));
}

let distanceToArc = (vertex, arc) => {
  // https://bl.ocks.org/milkbread/11000965

  // http://www.analyzemath.com/Calculators/Circle_Line.html
  // circle (x - h)^2 + (y - k)^2 = r^2
  // line y = m*x + b

  let x1 = vertex.x
  let y1 = vertex.y
  let x2 = arc.position.x
  let y2 = arc.position.y

  let m = (y2 - y1) / (x2 - x1)
  let b = y1 - m * x1

  let h = arc.position.x
  let k = arc.position.y
  let r = arc.geometry.parameters.radius

  let A = 1 + m * m
  let B = -2 * h + 2 * m * b - 2 * k * m
  let C = h * h + b * b + k * k - 2 * k * b - r * r
  let delta = B * B - 4 * A * C

  if (delta >= 0) {
    let x1 = (-B + Math.sqrt(delta)) / (2 * A)
    let x2 = (-B - Math.sqrt(delta)) / (2 * A)
    let y1 = m * x1 + b
    let y2 = m * x2 + b

    let intersectPoint1 = new THREE.Vector3(x1, y1, 0)
    let intersectPoint2 = new THREE.Vector3(x2, y2, 0)

    let arcAngle1 = circleIntersectionAngle(intersectPoint1, arc.position, r)
    let arcAngle2 = circleIntersectionAngle(intersectPoint2, arc.position, r)

    // fix problem when thetaStart + thetaLength > 2pi AND arcAngle < thetastart
    if (arc.geometry.parameters.thetaStart + arc.geometry.parameters.thetaLength > Math.PI * 2) {
      if (arc.geometry.parameters.thetaStart > arcAngle1) {
        arcAngle1 += Math.PI * 2
      }
      if (arc.geometry.parameters.thetaStart > arcAngle2) {
        arcAngle2 += Math.PI * 2
      }
    }

    // todo: handle tangent line to arc

    let intersect1Distance = null
    let intersect2Distance = null

    if (arcAngle1 >= arc.geometry.parameters.thetaStart && arcAngle1 <= arc.geometry.parameters.thetaStart + arc.geometry.parameters.thetaLength) {
      intersect1Distance = intersectPoint1.distanceTo(vertex)
    }

    if (arcAngle2 >= arc.geometry.parameters.thetaStart && arcAngle2 <= arc.geometry.parameters.thetaStart + arc.geometry.parameters.thetaLength) {
      intersect2Distance = intersectPoint2.distanceTo(vertex)
    }

    if (intersect1Distance || intersect2Distance) {
      return (intersect1Distance && intersect2Distance && Math.min(intersect1Distance, intersect2Distance)) || intersect1Distance || intersect2Distance
    }

    // in case of no-intersection get distance to nearest arc-endpoint
    let arc1v1 = new THREE.Vector3(0, 0, 0)
    arc1v1.addVectors(arc.geometry.vertices[0], arc.position)

    let arc1v2 = new THREE.Vector3(0, 0, 0)
    arc1v2.addVectors(arc.geometry.vertices[arc.geometry.vertices.length - 1], arc.position)

    return Math.min(arc1v1.distanceTo(vertex), arc1v2.distanceTo(vertex))
  } else {
    // no intersection
  }
  return false
}

function distanceToLineSegment (lx1, ly1, lx2, ly2, px, py) {
  // source from https://github.com/scottglz/distance-to-line-segment/blob/master/index.js

  let ldx = lx2 - lx1
  let ldy = ly2 - ly1
  let lineLengthSquared = ldx * ldx + ldy * ldy
  let t // t===0 at line pt 1 and t ===1 at line pt 2

  if (!lineLengthSquared) {
    // 0-length line segment. Any t will return same result
    t = 0
  } else {
    t = ((px - lx1) * ldx + (py - ly1) * ldy) / lineLengthSquared

    if (t < 0) { t = 0 } else if (t > 1) { t = 1 }
  }

  let lx = lx1 + t * ldx
  let ly = ly1 + t * ldy
  let dx = px - lx
  let dy = py - ly
  return Math.sqrt(dx * dx + dy * dy)
}

let distanceToEntity = (vertex, entity) => {
  if (entity.geometry instanceof THREE.CircleGeometry) {
    //get distance to arc
    return distanceToArc(vertex, entity);
  } else {
    //get distance to line
    let v0 = entity.geometry.vertices[0];
    let v1 = entity.geometry.vertices[entity.geometry.vertices.length - 1];
    return distanceToLineSegment(v0.x, v0.y, v1.x, v1.y, vertex.x, vertex.y);
  }
}

function circleIntersectionAngle (vertex, circle, radius) {
  let projectionLine = Math.abs(vertex.x - circle.x)
  let angle = Math.acos(projectionLine / radius)
  // console.log({q}, Math.acos(q/r1), Math.acos(q/r1) / Math.PI * 180);
  if (vertex.x < circle.x && vertex.y < circle.y) {
    // III quadrant
    angle += Math.PI
  } else if (vertex.x < circle.x && vertex.y > circle.y) {
    // II quadrant
    angle = Math.PI - angle
  } else if (vertex.x > circle.x && vertex.y < circle.y) {
    // IV quadrant
    angle = 2 * Math.PI - angle
  } else {
    // in I quadrant
    // ok
  }
  return angle
}

/**
 *
 * @param entities []
 * @param threshold number
 * @return []
 */
function skipZeroLines (entities, threshold) {
  // filter and remove zero lines like that:
  // entity.geometry.vertices = [
  //     THREE.Vector3 {x: -323.9003129597497, y: -131.8572032025505, z: 0},
  //     THREE.Vector3 {x: -323.9003129597497, y: -131.8572032025505, z: 0}
  // ]

  return entities.filter(entity => {
    if (!(entity.geometry instanceof THREE.CircleGeometry) && entity.geometry.vertices.length === 2) {
      return (entity.geometry.vertices[0].distanceTo(entity.geometry.vertices[1]) > threshold)
    }
    return true
  })
}

function getFirstVertex (entity) {
  if (entity.geometry instanceof THREE.CircleGeometry) {
    // arc
    let vertex = new THREE.Vector3(0, 0, 0)
    return vertex.addVectors(entity.geometry.vertices[0], entity.position)
  } else {
    // line?
    return entity.geometry.vertices[0]
  }
}

function getAnotherVertex (entity, vertex) {
  let vertices = []
  if (entity.geometry instanceof THREE.CircleGeometry) {
    // arc
    let vertex = new THREE.Vector3(0, 0, 0)
    vertices.push(vertex.addVectors(entity.geometry.vertices[0], entity.position))

    vertex = new THREE.Vector3(0, 0, 0)
    vertices.push(vertex.addVectors(entity.geometry.vertices[entity.geometry.vertices.length - 1], entity.position))
  } else {
    // line?
    vertices = entity.geometry.vertices
  }

  let anotherVertex = vertices[0]
  let distance = vertex.distanceTo(anotherVertex)

  vertices.forEach(v => {
    if (vertex.distanceTo(v) > distance) {
      anotherVertex = v
      distance = vertex.distanceTo(v)
    }
  })

  return anotherVertex
}

let linesIntersect = (a, b, c, d, detailedResult = false) => {
  // https://stackoverflow.com/questions/563198/how-do-you-detect-where-two-line-segments-intersect
  // https://ideone.com/PnPJgb
  // https://github.com/pgkelley4/line-segments-intersect/blob/master/js/line-segments-intersect.js

  // Determines if the lines AB and CD intersect.
  let CmP = new THREE.Vector3(c.x - a.x, c.y - a.y)
  let r = new THREE.Vector3(b.x - a.x, b.y - a.y)
  let s = new THREE.Vector3(d.x - c.x, d.y - c.y)

  let CmPxr = CmP.x * r.y - CmP.y * r.x
  let CmPxs = CmP.x * s.y - CmP.y * s.x
  let rxs = r.x * s.y - r.y * s.x

  // if (debug) {
  //     debugger;
  // }

  if (CmPxr === 0 && CmPxs === 0) {
    // Lines are collinear, and so intersect if they have any overlap
    // return ((c.x - a.x < 0) != (c.x - b.x < 0)) || ((c.y - a.y < 0) != (c.y - b.y < 0));

    // check if any vertex in line segment
    // a
    let inA = ((a.x - c.x < 0) !== (a.x - d.x < 0)) || ((a.y - c.y < 0) !== (a.y - d.y < 0))
    // b
    let inB = ((b.x - c.x < 0) !== (b.x - d.x < 0)) || ((b.y - c.y < 0) !== (b.y - d.y < 0))
    // c
    let inC = ((c.x - a.x < 0) !== (c.x - b.x < 0)) || ((c.y - a.y < 0) !== (c.y - b.y < 0))
    // d
    let inD = ((d.x - a.x < 0) !== (d.x - b.x < 0)) || ((d.y - a.y < 0) !== (d.y - b.y < 0))

    let isIntersects = (inA || inB || inC || inD)

    if (!detailedResult) {
      return isIntersects
    }

    let distance, point

    if (isIntersects) {
      point = inA ? a : (inB ? b : (inC ? c : d))
      distance = 0
    }

    if (!isIntersects) {
      // get distance between nearest points
      distance = Math.min(
        getDistance(a, c),
        getDistance(a, d),
        getDistance(b, c),
        getDistance(b, d)
      )
    }

    return {
      isIntersects,
      point,
      distance,
      collinear: true
    }
    //
    //
  }

  if (rxs === 0) {
    // Lines are parallel.
    return false
  }

  let rxsr = 1 / rxs
  let t = CmPxs * rxsr
  let u = CmPxr * rxsr

  let isIntersects = (t >= 0) && (t <= 1) && (u >= 0) && (u <= 1)

  if (!detailedResult) {
    return isIntersects
  }

  // else detailed result

  let point
  let distance = 0

  if (isIntersects) {
    // intersection point

    point = r.clone().multiplyScalar(t)
    point.addVectors(point, a)
  } else {
    // nearest point

    let lineVertices
    if (Math.abs(t % 1) < Math.abs(u % 1)) {
      lineVertices = [c, d]
      point = t < 0 ? a : b
    } else {
      lineVertices = [a, b]
      point = u < 0 ? c : d
    }

    distance = distanceToLine(point, {geometry: {vertices: lineVertices}})
    if (distance === 0) {
      // point on line path, so distance to line is 0. now calc distance to nearest vertex
      distance = Math.min(
        getDistance(point, lineVertices[0]),
        getDistance(point, lineVertices[1])
      )
    }
  }

  return {
    isIntersects,
    point,
    distance,
    collinear: false
  }
}

let getDistance = (a, b) => {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2))
}

let isBetween = (a, b, c, threshold = 0) => {
  // return getDistance(a, c) + getDistance(c, b) === getDistance(a, b);
  return Math.abs(getDistance(a, c) + getDistance(c, b) - getDistance(a, b)) <= threshold

  // return getDistance(a, c) + getDistance(c, b) === getDistance(a, b);
}

export default {
  distanceToLine,
  distanceToArc,
  skipZeroLines,
  getFirstVertex,
  getAnotherVertex,
  linesIntersect,
  getDistance,
  isBetween,
  buildEdgeModel
}