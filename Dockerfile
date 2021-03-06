FROM node:16-alpine as builderFront

WORKDIR /npm/docktor
COPY client .

RUN npm install \
  && npm run lint \
  && CI=true npm test \
  && npm run build

FROM golang:1.16.5 as builderBack

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

CMD ["./app", "-config", ""]
VOLUME [ "/docktor/assets" ]

EXPOSE 8080
