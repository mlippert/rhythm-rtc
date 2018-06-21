# Data given to MM viz:
# {'participants': [<participantId, participantId, ...],
#  'names'?: [<participantName, participantName, ...],
#  'transitions': <Number Of transitions in interval>,
#  'turns': [{'participant': <participantId>,
#             'turns': <Percent of turns in interval by this participant>}, ...]
  d3 = Object.assign({},
                     require('d3-selection'),
                     require('d3-scale'),
                     require('d3-transition'),
                    )

  NETWORK_RADIUS = 115
  PARTICIPANT_NODE_RADIUS = 20
  ENERGY_NODE_RADIUS = 30

  PARTICIPANT_NODE_COLOR_LOCAL = '#092070'
  PARTICIPANT_NODE_COLOR_OTHER = '#3AC4C5'

  # get array of participant nodes from data
  nodesFromData = (data) ->
    nodes = ({'participant': p, 'name': (data.names?[i] ? p)[0]} for p, i in data.participants)
    nodes.push({'participant': 'energy'}) # keep the energy ball in the list of nodes
    return nodes

  # create links, 1 link to the energy ball for each participant
  # give it a 0 default weight
  linksFromData = (data) ->
    links = ({'source': p, 'target': 'energy', 'weight': 0} for p in data.participants)
    return links

  # exported MeetingMediator class
  module.exports.MeetingMediator = class MM
    constructor: (@data, @localParticipants, width, height) ->

      console.log "constructing MM with data:", @data
      @fontFamily = "Futura,Helvetica Neue,Helvetica,Arial,sans-serif"
      @margin = {top: 0, right: 0, bottom: 0, left: 0}
      @width = width - @margin.right - @margin.left
      @height = height - @margin.bottom - @margin.top

      # radius of network as a whole
      @radius = NETWORK_RADIUS

      # distributes positions for participant avatars evenly in a circle
      @angle = d3.scalePoint()
        .domain @data.participants
        .range [0, 360]
        .padding 0.5

      # determines thickness of edges
      @linkStrokeScale = d3.scaleLinear()
        .domain [0, 1]
        .range [3, 15]

      # color scale for sphere in the middle
      @sphereColorScale = d3.scaleLinear()
        .domain [0, @data.participants.length * 3]
        .range ['#C8E6C9', '#2E7D32']
        .clamp true

      # create initial node data
      @nodes = nodesFromData @data
      @links = linksFromData @data
      @updateLinkWeight()

      @nodeTransitionTime = 500
      @linkTransitionTime = 500

    # d3func - node radius based on participant
    nodeRadius: (d) =>
      if (d.participant == "energy")
        ENERGY_NODE_RADIUS
      else
        PARTICIPANT_NODE_RADIUS


    render: (id="#meeting-mediator") ->
      @chart = d3.select id
        .append "svg"
        .attr "class", "meeting-mediator"
        .attr "width", @width + @margin.left + @margin.right
        .attr "height", @height + @margin.top + @margin.bottom
        .append "g"
        .attr "transform", "translate(#{ @width / 2 },#{ @height / 2 })"

      @chartBody = @chart.append "g"
        .attr "width", @width
        .attr "height", @height

      @graphG = @chart.append "g"
        .attr "width", @width
        .attr "height", @height

      @outline = @chartBody.append "g"
        .attr "id", "outline"
        .append "circle"
        .style "stroke", "#AFAFAF"
        .attr "stroke-width", 3
        .style "stroke-dasharray", ("10, 5")
        .attr "fill", "transparent"
        .attr "r", @radius + PARTICIPANT_NODE_RADIUS + 2

      # put links / nodes in a separate group
      @linksG = @graphG.append "g"
        .attr "id", "links"
      @nodesG = @graphG.append "g"
        .attr "id", "nodes"

      @renderNodes()
      @renderLinks()
      # keeps user node at top
      @graphG.transition().duration(250)
        .attr "transform", @constantRotation()

    # a little complicated, since we want to be able to put text
    # and prettier stuff on nodes in the future (maybe).
    # We create a group for each node, and do a selection for moving them around.
    renderNodes: () ->
      nodeGs = @nodesG.selectAll ".node"
        .data @nodes, (d) -> d.participant

      # remove node groups for nodes that have left
      nodeGs.exit().remove()

      # new node groups - add attributes and child elements
      nodeGsEnter = nodeGs.enter().append "g"
        .attr "class", "node"
        .attr "id", (d) -> d.participant

      nodeGsEnter.append "circle"
        .attr "class", "nodeCircle"
        .attr "fill", @nodeColor
        .attr "r", @nodeRadius

      nodeGsEnter.append "circle"
        .attr "class", "nodeFill"
        .attr "fill", "#FFFFFF"
        .attr "r", (d) =>
          if (d.participant == 'energy' or @localParticipants.includes(d.participant))
            0
          else
            @nodeRadius(d) - 3

      nodeGsEnter.append "text"
        .attr "text-anchor", "middle"
        .attr "font-size", "24px"
        .attr "dy", ".35em"
        .attr "transform", (d) =>
          if (d.participant == 'energy')
            ""
          else
            "rotate(#{ (-1 * (@constantRotationAngle() + @angle(d.participant))) })"
        .attr "fill", (d) =>
          if (@localParticipants.includes(d.participant))
            "#FFFFFF"
          else
            "#000000"
        .text (d) -> d.name

      # all node groups
      @nodesG.selectAll(".node").transition().duration(500)
        .attr "transform", @nodeTransform
        .select('circle') # change circle color
        .attr "fill", @nodeColor

    # d3func - different colors for different types of nodes...
    nodeColor: (d) =>
      if (d.participant == 'energy')
        @sphereColorScale(@data.transitions)
      else if @localParticipants.includes(d.participant)
        PARTICIPANT_NODE_COLOR_LOCAL
      else
        PARTICIPANT_NODE_COLOR_OTHER

    # d3func - we have different kinds of nodes, so this just abstracts
    # out the transform function.
    nodeTransform: (d) =>
      if (d.participant == "energy")
        @sphereTranslation()
      else
        "rotate(#{ @angle(d.participant) })translate(#{ @radius },0)"

    # d3func - a translation between the angle rotation for nodes
    # and the raw x/y positions. Used for computing link endpoints.
    getNodeCoords: (id) =>
      transformText = @nodeTransform({'participant': id})
      t = MM.getTransformation(transformText)
      return {'x': t.translate.x, 'y': t.translate.y}


    renderLinks: () ->
      linkGs = @linksG.selectAll "line.link"
        .data @links, (d) -> d.source

      # remove links for participants who have left
      linkGs.exit().remove()

      # add links for new participants
      linkGs.enter().append "line"
        .attr "class", "link"
        .attr "stroke", "#646464"
        .attr "fill", "none"
        .attr "stroke-opacity", 0.8
        .attr "stroke-width", 7
        .attr "x1", (d) => @getNodeCoords(d.source)['x']
        .attr "y1", (d) => @getNodeCoords(d.source)['y']
        .attr "x2", (d) => @getNodeCoords(d.target)['x']
        .attr "y2", (d) => @getNodeCoords(d.target)['y']

      # update existing links
      linkGs
        .attr "x1", (d) => @getNodeCoords(d.source)['x']
        .attr "y1", (d) => @getNodeCoords(d.source)['y']
        .attr "x2", (d) => @getNodeCoords(d.target)['x']
        .attr "y2", (d) => @getNodeCoords(d.target)['y']

      # all links
      @linksG.selectAll("line.link").transition().duration(@linkTransitionTime)
        .attr "stroke-width", (d) => @linkStrokeScale d.weight


    # d3func - translation / position for "energy" ball.
    # Moves closer (just based on weighting) to nodes.
    sphereTranslation: () =>
      x = 0
      y = 0

      for turn in @data.turns
        coords = @getNodeCoords(turn.participant)
        # get coordinates of this node & distance from ball
        node_x = coords['x']
        node_y = coords['y']
        xDist = (node_x - x)
        yDist = (node_y - y)

        # transform x and y proportional to the percentage of turns
        # (and use dist/2 to prevent collision)
        x += turn.turns * (xDist / 2)
        y += turn.turns * (yDist / 2)
      return "translate(#{ x },#{ y })"


    # the angle to rotate the graph by to put the user's node at the top.
    constantRotationAngle: () ->
      # TODO unsure about this
      angle = @angle(@localParticipants[0]) || 0
      targetAngle = -90
      a = targetAngle - angle
      a = (a + 180) % 360 - 180
      if (angle != -90)
        return a
      else
        return 0

    # d3func - This returns a translation string to rotate the _entire_
    # "graph group" to keep the user's node at the top.
    constantRotation: () =>
      return "rotate(#{ @constantRotationAngle() })"

    # update the link weight from current turn data
    updateLinkWeight: () ->
      for link in @links
        link.weight = (@data.turns.find (turn) => turn.participant is link.source)?.turns ? 0
      return


    updateData: (data) ->
      console.log "updating MM viz with data:", data
      # if we're not updating participants, don't redraw everything.
      if data.participants.length == @data.participants.length
        @data = data
        @updateLinkWeight()

        @renderLinks()
        @renderNodes()
      else
        # Create nodes again
        @data = data
        @nodes = nodesFromData @data
        @links = linksFromData @data
        @updateLinkWeight()

        # recompute the color scale for the sphere and angle domain
        @sphereColorScale.domain [0, data.participants.length * 5]
        @angle.domain @data.participants

        # recompute links
        @link = @linksG.selectAll "line.link"
        .data []
        .exit().remove()
        # Re-render. Do it on a delay to make sure links get rendered after nodes.
        # After links, rotate entire graph so user is at top.
        @renderNodes()
        setTimeout((() =>
          @renderLinks()
          @graphG.transition().duration(100)
            .attr "transform", @constantRotation()
          ), @nodeTransitionTime + 100)


    # Function copied pretty much verbatim from stackoverflow for replacing use of
    # the V3 d3.transform when moving to d3 V4
    # https://stackoverflow.com/questions/38224875/replacing-d3-transform-in-d3-v4
    @getTransformation: (transform) ->
      # Create a dummy g for calculation purposes only. This will never
      # be appended to the DOM and will be discarded once this function 
      # returns.
      g = document.createElementNS "http://www.w3.org/2000/svg", "g"

      # Set the transform attribute to the provided string value.
      g.setAttributeNS null, "transform", transform

      # consolidate the SVGTransformList containing all transformations
      # to a single SVGTransform of type SVG_TRANSFORM_MATRIX and get
      # its SVGMatrix.
      identityMatrix = {a: 1, b: 0, c: 0, d: 1, e: 0, f: 0}
      matrix = g.transform.baseVal.consolidate()?.matrix ? identityMatrix

      # Below calculations are taken and adapted from the private function
      # transform/decompose.js of D3's module d3-interpolate.
      {a, b, c, d, e, f} = matrix
      if scaleX = Math.sqrt(a * a + b * b) then a /= scaleX;    b /= scaleX
      if skewX = a * c + b * d             then c -= a * skewX; d -= b * skewX
      if scaleY = Math.sqrt(c * c + d * d) then c /= scaleY;    d /= scaleY; skewX /= scaleY
      if a * d < b * c                     then a = -a;         b = -b;      skewX = -skewX; scaleX = -scaleX

      return
        translate:
          x: e
          y: f
        rotate: Math.atan2(b, a) * 180 / Math.PI
        skewX: Math.atan(skewX) * 180 / Math.PI
        scale:
          x: scaleX
          y: scaleY
