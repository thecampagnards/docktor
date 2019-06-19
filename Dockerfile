FROM node:12-alpine as builderFront

WORKDIR /npm/docktor
COPY client .

RUN npm install \
  && CI=true npm test \
  && npm run build

FROM golang:1.12.6 as builderBack

WORKDIR /go/docktor/server
COPY server .

RUN go test ./... \
  && CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -a -installsuffix cgo -o app . \
  && chmod +x app

FROM scratch

LABEL maintainer="TheCampagnards <konstantin.sidorenko@orange.fr>"

WORKDIR /docktor

COPY --from=builderFront /npm/docktor/build client
COPY --from=builderBack /go/docktor/server/app .
COPY --from=builderBack /go/docktor/server/assets assets

CMD ["./app"]
VOLUME [ "/docktor/assets" ]

EXPOSE 8080