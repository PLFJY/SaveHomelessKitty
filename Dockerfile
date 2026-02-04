FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY SaveHomelessKitty/SaveHomelessKitty.csproj SaveHomelessKitty/
RUN dotnet restore SaveHomelessKitty/SaveHomelessKitty.csproj
COPY SaveHomelessKitty/ SaveHomelessKitty/
RUN dotnet publish SaveHomelessKitty/SaveHomelessKitty.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
ENV ASPNETCORE_URLS=http://0.0.0.0:8080
EXPOSE 8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "SaveHomelessKitty.dll"]
